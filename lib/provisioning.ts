import { supabase, supabaseAdmin } from './supabase';
import { 
  ProvisioningQueue, 
  CustomerBackend, 
  CredentialSubmissionData, 
  MigrationLog,
  OnboardingFormData,
  QueueStats,
  ApiResponse,
  QueuePositionResponse
} from '@/types/provisioning';
import { encryptData, decryptData } from './security';
import { createClient } from '@supabase/supabase-js';
import { EmailService } from './email';
import { logger } from './logger';

// Helper to ensure supabaseAdmin is not null
function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }
  return supabaseAdmin;
}

// Queue Management
export class ProvisioningService {
  // Create new provisioning request
  static async createProvisioningRequest(
    customerId: string, 
    formData: OnboardingFormData
  ): Promise<ApiResponse<{ queue_id: string }>> {
    try {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from('provisioning_queue')
        .insert({
          customer_id: customerId,
          status: 'pending',
          priority: formData.plan_type === 'enterprise' ? 2 : formData.plan_type === 'professional' ? 1 : 0,
          requested_features: formData.selected_features,
          customer_email: formData.supabase_email,
          customer_temp_password: formData.supabase_password || undefined,
        })
        .select('id')
        .single();

      if (error) throw error;

      // Log the action
      await this.logAuditEvent('queue_created', customerId, undefined, {
        plan_type: formData.plan_type,
        features: formData.selected_features
      });

      // Send welcome email with queue position
      const queueResponse = await this.getQueuePosition(customerId);
      if (queueResponse.success && queueResponse.data) {
        await EmailService.sendEmail({
          to: formData.email,
          template: 'waiting',
          data: {
            customerName: formData.contact_name,
            customerId,
            queuePosition: queueResponse.data.position,
            estimatedTime: this.formatWaitTime(queueResponse.data.estimated_wait_hours),
            aheadInQueue: queueResponse.data.ahead_in_queue,
            plan: formData.plan_type,
          }
        });
      }

      // Send admin alert
      await EmailService.sendAdminAlert({
        companyName: formData.company_name,
        contactName: formData.contact_name,
        customerEmail: formData.email,
        plan: formData.plan_type,
        priority: formData.plan_type === 'enterprise' ? 'Urgent' : formData.plan_type === 'professional' ? 'High' : 'Normal',
        queuePosition: queueResponse.data?.position || 1,
        waitingTime: 'Just now',
        features: formData.selected_features,
      });

      return { success: true, data: { queue_id: data.id } };
    } catch (error) {
      logger.error('Error creating provisioning request', { error: error instanceof Error ? error.message : 'Unknown error', customerId, formData: { plan_type: formData.plan_type, company_name: formData.company_name } });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get queue position for customer
  static async getQueuePosition(customerId: string): Promise<ApiResponse<QueuePositionResponse>> {
    try {
      const admin = getSupabaseAdmin();
      
      // Get customer's queue entry
      const { data: customerQueue, error: queueError } = await admin
        .from('provisioning_queue')
        .select('created_at, priority, status')
        .eq('customer_id', customerId)
        .single();

      if (queueError) {
        logger.error('Queue Position Debug: Error getting customer queue', { error: queueError.details, customerId });
        throw queueError;
      }

      logger.debug('Queue Position Debug: Customer queue data', { customerQueue, customerId });

      // If customer is not pending anymore, return current status
      if (customerQueue.status !== 'pending') {
        return {
          success: true,
          data: {
            position: 0,
            estimated_wait_hours: 0,
            ahead_in_queue: 0,
            status: customerQueue.status
          }
        };
      }

      // Count how many are ahead in queue with proper priority ordering
      const { count, error: countError } = await admin
        .from('provisioning_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .or(`priority.gt.${customerQueue.priority},and(priority.eq.${customerQueue.priority},created_at.lt.${customerQueue.created_at})`);

      if (countError) {
        logger.error('Queue Position Debug: Error counting ahead', { error: countError.details, customerId });
        throw countError;
      }

      logger.debug('Queue Position Debug: Count ahead', { count, customerId });

      // Calculate estimated wait time (rough estimate: 30 mins per item in queue)
      const estimatedWaitHours = (count || 0) * 0.5;

      const position = (count || 0) + 1;
      logger.info('Queue Position Calculated', { position, customerId, waitTime: estimatedWaitHours });

      return {
        success: true,
        data: {
          position,
          estimated_wait_hours: estimatedWaitHours,
          ahead_in_queue: count || 0,
          status: 'pending'
        }
      };
    } catch (error) {
      console.error('🔧 Queue Position Debug: Error getting queue position:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get provisioning queue for admin dashboard
  static async getProvisioningQueue(
    status?: string,
    limit: number = 50
  ): Promise<ApiResponse<ProvisioningQueue[]>> {
    try {
      const admin = getSupabaseAdmin();
      let query = admin
        .from('provisioning_queue')
        .select(`
          *,
          customer:customers(id, company_name, email, contact_name),
          assigned_admin:admin_users(id, name, email)
        `)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query.limit(limit);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error getting provisioning queue:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Claim a provisioning task
  static async claimProvisioningTask(
    queueId: string, 
    adminId: string
  ): Promise<ApiResponse> {
    try {
      console.log('🔧 Provisioning Debug: Attempting to claim task:', { queueId, adminId })
      
      const admin = getSupabaseAdmin();
      if (!admin) {
        console.log('🔧 Provisioning Debug: Admin client not available')
        throw new Error('Supabase admin client not configured');
      }

      console.log('🔧 Provisioning Debug: Admin client available, querying provisioning_queue...')
      
      const { data, error } = await admin
        .from('provisioning_queue')
        .update({
          status: 'in_progress',
          admin_assigned_to: adminId,
          started_at: new Date().toISOString(),
          last_status_update: new Date().toISOString()
        })
        .eq('id', queueId)
        .eq('status', 'pending') // Prevent race conditions
        .select('customer_id')
        .single();

      console.log('🔧 Provisioning Debug: Query result:', { data, error })

      if (error) {
        console.log('🔧 Provisioning Debug: Database error:', error)
        throw error;
      }

      if (!data) {
        console.log('🔧 Provisioning Debug: No data returned - task not found or already claimed')
        throw new Error('Task not found or already claimed');
      }

      // Temporarily disable audit logging to isolate the issue
      // await this.logAuditEvent('task_claimed', data.customer_id, adminId, { queue_id: queueId });

      console.log('🔧 Provisioning Debug: Task claimed successfully')
      return { success: true };
    } catch (error) {
      console.error('🔧 Provisioning Debug: Error claiming provisioning task:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Submit credentials and start migration
  static async submitCredentials(
    queueId: string,
    credentials: CredentialSubmissionData,
    adminId: string
  ): Promise<ApiResponse> {
    try {
      // Validate credentials format
      const validation = this.validateCredentials(credentials);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Test connectivity to customer's Supabase
      const connectivityTest = await this.testSupabaseConnection(credentials);
      if (!connectivityTest.success) {
        return { success: false, error: 'Failed to connect to Supabase project. Please check credentials.' };
      }

      // Get queue details
      const admin = getSupabaseAdmin();
      const { data: queue, error: queueError } = await admin
        .from('provisioning_queue')
        .select('customer_id, requested_features')
        .eq('id', queueId)
        .single();

      if (queueError) throw queueError;

      // Encrypt sensitive credentials
      const encryptedCredentials = {
        anon_key: encryptData(credentials.anon_key),
        service_role_key: encryptData(credentials.service_role_key),
        database_password: credentials.database_password ? encryptData(credentials.database_password) : null,
      };

      // Create customer backend record
      const { data: backend, error: backendError } = await admin
        .from('customer_backends')
        .insert({
          customer_id: queue.customer_id,
          supabase_project_ref: credentials.project_ref,
          supabase_api_url: credentials.project_url,
          ...encryptedCredentials,
          region: credentials.region || 'us-east-1',
          credentials_submitted_by: adminId,
          credentials_submitted_at: new Date().toISOString(),
          provisioning_status: 'credentials_received'
        })
        .select('id')
        .single();

      if (backendError) throw backendError;

      // Update queue status
      await admin
        .from('provisioning_queue')
        .update({
          status: 'credentials_received',
          last_status_update: new Date().toISOString()
        })
        .eq('id', queueId);

      // Log the action
      await this.logAuditEvent('credentials_submitted', queue.customer_id, adminId, {
        backend_id: backend.id,
        project_ref: credentials.project_ref
      });

      // Trigger migration (this would be a background job in production)
      // For now, we'll call it directly
      await this.executeMigration(queue.customer_id, credentials, queue.requested_features, adminId);

      return { success: true };
    } catch (error) {
      console.error('Error submitting credentials:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Execute migration to customer's Supabase
  static async executeMigration(
    customerId: string,
    credentials: CredentialSubmissionData,
    features: string[],
    adminId: string
  ): Promise<ApiResponse> {
    const migrationLogs: MigrationLog[] = [];
    
    try {
      // Update queue status to migrating
      const admin = getSupabaseAdmin();
      await admin
        .from('provisioning_queue')
        .update({
          status: 'migrating',
          last_status_update: new Date().toISOString()
        })
        .eq('customer_id', customerId);

      // Connect to customer's Supabase
      const customerSupabase = createClient(credentials.project_url, credentials.service_role_key);

      // 1. Run base schema
      const baseSchema = await this.getBaseSchema();
      await this.runSQL(customerSupabase, baseSchema);
      migrationLogs.push({ step: 'base_schema', status: 'success' });

      // 2. Feature-specific migrations
      for (const feature of features) {
        try {
          const migrationSQL = await this.getFeatureMigration(feature);
          await this.runSQL(customerSupabase, migrationSQL);
          migrationLogs.push({ step: feature, status: 'success' });
        } catch (error) {
          migrationLogs.push({ 
            step: feature, 
            status: 'failed', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
          throw error;
        }
      }

      // 3. Configure auth settings
      await this.configureAuth(customerSupabase, features);
      migrationLogs.push({ step: 'auth_config', status: 'success' });

      // 4. Setup RLS policies
      await this.setupRLSPolicies(customerSupabase, customerId);
      migrationLogs.push({ step: 'rls_policies', status: 'success' });

      // 5. Update backend status
      await getSupabaseAdmin()
        .from('customer_backends')
        .update({
          provisioning_status: 'active',
          migration_logs: migrationLogs,
          last_health_check: new Date().toISOString()
        })
        .eq('customer_id', customerId);

      // 6. Update queue status to completed
      await getSupabaseAdmin()
        .from('provisioning_queue')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          last_status_update: new Date().toISOString()
        })
        .eq('customer_id', customerId);

      // 7. Log completion
      await this.logAuditEvent('migration_completed', customerId, adminId, {
        features,
        total_steps: migrationLogs.length
      });

      // 8. Send notification to customer (this would trigger email service)
      await this.notifyCustomerReady(customerId, features);

      return { success: true, data: { logs: migrationLogs } };
    } catch (error) {
      migrationLogs.push({ 
        step: 'error', 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });

      // Update status to failed
      await getSupabaseAdmin()
        .from('provisioning_queue')
        .update({
          status: 'failed',
          last_status_update: new Date().toISOString()
        })
        .eq('customer_id', customerId);

      await getSupabaseAdmin()
        .from('customer_backends')
        .update({
          provisioning_status: 'error',
          migration_logs: migrationLogs
        })
        .eq('customer_id', customerId);

      await this.logAuditEvent('migration_failed', customerId, adminId, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  // Helper methods
  private static formatWaitTime(hours: number): string {
    if (hours < 1) return 'Less than 1 hour'
    if (hours < 24) return `${Math.round(hours)} hours`
    return `${Math.round(hours / 24)} days`
  }

  private static validateCredentials(credentials: CredentialSubmissionData): { valid: boolean; error?: string } {
    if (!credentials.project_ref || credentials.project_ref.length !== 20) {
      return { valid: false, error: 'Invalid project reference format' };
    }

    if (!credentials.project_url || !credentials.project_url.includes('.supabase.co')) {
      return { valid: false, error: 'Invalid project URL format' };
    }

    if (!credentials.anon_key || credentials.anon_key.length < 30) {
      return { valid: false, error: 'Invalid anon key format' };
    }

    if (!credentials.service_role_key || credentials.service_role_key.length < 30) {
      return { valid: false, error: 'Invalid service role key format' };
    }

    return { valid: true };
  }

  private static async testSupabaseConnection(credentials: CredentialSubmissionData): Promise<ApiResponse> {
    try {
      const testClient = createClient(credentials.project_url, credentials.service_role_key);
      const { data, error } = await testClient.from('_test_connection').select('*').limit(1);
      
      // We expect an error here since the table doesn't exist, but it proves connection works
      if (error && !error.message.includes('does not exist')) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
    }
  }

  private static async runSQL(client: any, sql: string): Promise<void> {
    const { error } = await client.rpc('exec_sql', { sql_string: sql });
    if (error) throw error;
  }

  private static async getBaseSchema(): Promise<string> {
    // Return base schema that all customers get
    return `
      -- Base schema for all KiTS customers
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      -- Users table for customer's employees
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text UNIQUE NOT NULL,
        name text NOT NULL,
        role text DEFAULT 'user',
        created_at timestamptz DEFAULT now()
      );
      
      -- Enable RLS
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      
      -- Basic RLS policy
      CREATE POLICY "Users can view own profile" ON users
        FOR SELECT USING (auth.uid() = id);
    `;
  }

  private static async getFeatureMigration(feature: string): Promise<string> {
    // Get feature template from database
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('feature_templates')
      .select('migration_sql')
      .eq('feature_key', feature)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      throw new Error(`Feature template not found: ${feature}`);
    }

    return data.migration_sql;
  }

  private static async configureAuth(client: any, features: string[]): Promise<void> {
    // Configure auth settings based on features
    // This would include setting up auth providers, email templates, etc.
  }

  private static async setupRLSPolicies(client: any, customerId: string): Promise<void> {
    // Setup customer-specific RLS policies
    // All tables should have customer_id isolation
  }

  private static async logAuditEvent(
    action: string, 
    customerId?: string, 
    adminId?: string, 
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const admin = getSupabaseAdmin();
      await admin
        .from('provisioning_audit_log')
        .insert({
          customer_id: customerId,
          admin_id: adminId,
          action,
          details
        });
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  private static async notifyCustomerReady(customerId: string, features: string[]): Promise<void> {
    try {
      // Get customer details
      const admin = getSupabaseAdmin();
      const { data: customer } = await admin
        .from('customers')
        .select('email, contact_name')
        .eq('id', customerId)
        .single();

      if (customer) {
        await EmailService.sendReadyEmail(customer.email, customer.contact_name, features);
      }
    } catch (error) {
      console.error('Error sending ready notification:', error);
    }
  }

  // Get queue statistics for admin dashboard
  static async getQueueStats(): Promise<ApiResponse<QueueStats>> {
    try {
      const admin = getSupabaseAdmin();
      const { data: pending } = await admin
        .from('provisioning_queue')
        .select('id')
        .eq('status', 'pending');

      const { data: inProgress } = await admin
        .from('provisioning_queue')
        .select('id')
        .eq('status', 'in_progress');

      const today = new Date().toISOString().split('T')[0];
      const { data: completedToday } = await admin
        .from('provisioning_queue')
        .select('id')
        .eq('status', 'completed')
        .gte('completed_at', today);

      const { data: failedToday } = await admin
        .from('provisioning_queue')
        .select('id')
        .eq('status', 'failed')
        .gte('completed_at', today);

      const { data: overdue } = await admin
        .from('provisioning_queue')
        .select('id')
        .in('status', ['pending', 'in_progress'])
        .lt('estimated_completion', new Date().toISOString());

      return {
        success: true,
        data: {
          pending: pending?.length || 0,
          in_progress: inProgress?.length || 0,
          completed_today: completedToday?.length || 0,
          failed_today: failedToday?.length || 0,
          average_wait_time: 0, // Calculate based on historical data
          overdue_count: overdue?.length || 0
        }
      };
    } catch (error) {
      console.error('Error getting queue stats:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
