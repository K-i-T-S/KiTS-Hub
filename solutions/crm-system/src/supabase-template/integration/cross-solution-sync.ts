// KiTS Hub Cross-Solution Integration Service
// Handles data synchronization between different business solutions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface SyncConfig {
  sourceSolution: string
  targetSolution: string
  entityType: string
  syncType: 'real-time' | 'batch' | 'manual'
  fieldMappings: Record<string, string>
  filters?: Record<string, any>
  transform?: (data: any) => any
}

interface SyncJob {
  id: string
  tenantId: string
  sourceSolution: string
  targetSolution: string
  entityType: string
  syncType: 'real-time' | 'batch' | 'manual'
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  totalRecords: number
  processedRecords: number
  failedRecords: number
  startedAt?: Date
  completedAt?: Date
  error?: string
}

export class CrossSolutionSync {
  private supabase: any
  private activeJobs: Map<string, SyncJob> = new Map()

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey)
  }

  // Initialize sync service
  async initialize(): Promise<void> {
    console.log('Initializing Cross-Solution Sync Service...')
    
    // Start monitoring failed jobs for retry
    setInterval(() => this.retryFailedJobs(), 5 * 60 * 1000) // Every 5 minutes
    
    // Start processing pending jobs
    setInterval(() => this.processPendingJobs(), 30 * 1000) // Every 30 seconds
    
    console.log('Cross-Solution Sync Service initialized')
  }

  // Create a new sync job
  async createSyncJob(config: SyncConfig, tenantId: string): Promise<SyncJob> {
    const job: SyncJob = {
      id: crypto.randomUUID(),
      tenantId,
      sourceSolution: config.sourceSolution,
      targetSolution: config.targetSolution,
      entityType: config.entityType,
      syncType: config.syncType,
      status: 'pending',
      progress: 0,
      totalRecords: 0,
      processedRecords: 0,
      failedRecords: 0
    }

    // Save job to database
    const { error } = await this.supabase
      .from('sync_jobs')
      .insert({
        id: job.id,
        tenant_id: tenantId,
        source_solution: job.sourceSolution,
        target_solution: job.targetSolution,
        entity_type: job.entityType,
        sync_type: job.syncType,
        status: job.status,
        progress: job.progress,
        total_records: job.totalRecords,
        processed_records: job.processedRecords,
        failed_records: job.failedRecords,
        config: config
      })

    if (error) {
      throw new Error(`Failed to create sync job: ${error.message}`)
    }

    this.activeJobs.set(job.id, job)
    
    // Start processing immediately for real-time syncs
    if (config.syncType === 'real-time') {
      setImmediate(() => this.processJob(job.id))
    }

    return job
  }

  // Process a sync job
  private async processJob(jobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId)
    if (!job) return

    try {
      job.status = 'running'
      job.startedAt = new Date()
      await this.updateJobStatus(job)

      // Set tenant context
      await this.supabase.rpc('set_tenant_context', { p_tenant_id: job.tenantId })

      // Get job configuration
      const { data: jobData } = await this.supabase
        .from('sync_jobs')
        .select('config')
        .eq('id', jobId)
        .single()

      const config: SyncConfig = jobData.config

      // Get source data
      const sourceData = await this.getSourceData(config, job)
      job.totalRecords = sourceData.length
      await this.updateJobStatus(job)

      // Process records in batches
      const batchSize = 100
      for (let i = 0; i < sourceData.length; i += batchSize) {
        const batch = sourceData.slice(i, i + batchSize)
        
        for (const record of batch) {
          try {
            // Transform data if needed
            const transformedData = config.transform ? config.transform(record) : record
            
            // Map fields
            const mappedData = this.mapFields(transformedData, config.fieldMappings)
            
            // Sync to target
            await this.syncToTarget(config, mappedData, job)
            
            job.processedRecords++
          } catch (error) {
            console.error(`Failed to sync record ${record.id}:`, error)
            job.failedRecords++
          }
        }

        // Update progress
        job.progress = (job.processedRecords / job.totalRecords) * 100
        await this.updateJobStatus(job)

        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      job.status = 'completed'
      job.completedAt = new Date()
      await this.updateJobStatus(job)

      // Trigger webhooks if configured
      await this.triggerSyncWebhooks(job, config)

    } catch (error) {
      console.error(`Sync job ${jobId} failed:`, error)
      job.status = 'failed'
      job.error = error.message
      await this.updateJobStatus(job)
    } finally {
      this.activeJobs.delete(jobId)
    }
  }

  // Get source data based on entity type
  private async getSourceData(config: SyncConfig, job: SyncJob): Promise<any[]> {
    switch (config.entityType) {
      case 'customers':
        return await this.getCustomers(config, job.tenantId)
      case 'products':
        return await this.getProducts(config, job.tenantId)
      case 'sales':
        return await this.getSales(config, job.tenantId)
      case 'inventory':
        return await this.getInventory(config, job.tenantId)
      case 'employees':
        return await this.getEmployees(config, job.tenantId)
      default:
        throw new Error(`Unsupported entity type: ${config.entityType}`)
    }
  }

  // Get customers from source solution
  private async getCustomers(config: SyncConfig, tenantId: string): Promise<any[]> {
    let query = this.supabase
      .from('customers')
      .select('*')
      .eq('tenant_id', tenantId)

    // Apply filters
    if (config.filters) {
      Object.entries(config.filters).forEach(([key, value]) => {
        if (key === 'updated_after') {
          query = query.gte('updated_at', value)
        } else if (key === 'created_after') {
          query = query.gte('created_at', value)
        } else {
          query = query.eq(key, value)
        }
      })
    }

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch customers: ${error.message}`)
    return data || []
  }

  // Get products from source solution
  private async getProducts(config: SyncConfig, tenantId: string): Promise<any[]> {
    let query = this.supabase
      .from('products')
      .select('*')
      .eq('tenant_id', tenantId)

    if (config.filters) {
      Object.entries(config.filters).forEach(([key, value]) => {
        if (key === 'updated_after') {
          query = query.gte('updated_at', value)
        } else if (key === 'category_id') {
          query = query.eq('category_id', value)
        } else {
          query = query.eq(key, value)
        }
      })
    }

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch products: ${error.message}`)
    return data || []
  }

  // Get sales from source solution
  private async getSales(config: SyncConfig, tenantId: string): Promise<any[]> {
    let query = this.supabase
      .from('sales')
      .select('*')
      .eq('tenant_id', tenantId)

    if (config.filters) {
      Object.entries(config.filters).forEach(([key, value]) => {
        if (key === 'date_from') {
          query = query.gte('created_at', value)
        } else if (key === 'date_to') {
          query = query.lte('created_at', value)
        } else if (key === 'status') {
          query = query.eq('status', value)
        }
      })
    }

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch sales: ${error.message}`)
    return data || []
  }

  // Get inventory data
  private async getInventory(config: SyncConfig, tenantId: string): Promise<any[]> {
    let query = this.supabase
      .from('stock_movements')
      .select('*')
      .eq('tenant_id', tenantId)

    if (config.filters) {
      Object.entries(config.filters).forEach(([key, value]) => {
        if (key === 'date_from') {
          query = query.gte('created_at', value)
        } else if (key === 'movement_type') {
          query = query.eq('movement_type', value)
        }
      })
    }

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch inventory: ${error.message}`)
    return data || []
  }

  // Get employees
  private async getEmployees(config: SyncConfig, tenantId: string): Promise<any[]> {
    let query = this.supabase
      .from('employees')
      .select('*')
      .eq('tenant_id', tenantId)

    if (config.filters) {
      Object.entries(config.filters).forEach(([key, value]) => {
        if (key === 'department') {
          query = query.eq('department', value)
        } else if (key === 'is_active') {
          query = query.eq('is_active', value)
        }
      })
    }

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch employees: ${error.message}`)
    return data || []
  }

  // Map fields according to configuration
  private mapFields(data: any, fieldMappings: Record<string, string>): any {
    const mapped: any = {}
    
    Object.entries(fieldMappings).forEach(([sourceField, targetField]) => {
      if (data.hasOwnProperty(sourceField)) {
        mapped[targetField] = data[sourceField]
      }
    })
    
    return mapped
  }

  // Sync data to target solution
  private async syncToTarget(config: SyncConfig, data: any, job: SyncJob): Promise<void> {
    // This would integrate with external APIs or other systems
    // For now, we'll simulate by storing in a sync log table
    
    const { error } = await this.supabase
      .from('sync_logs')
      .insert({
        job_id: job.id,
        tenant_id: job.tenantId,
        source_solution: job.sourceSolution,
        target_solution: job.targetSolution,
        entity_type: job.entityType,
        entity_id: data.id,
        data,
        synced_at: new Date().toISOString()
      })

    if (error) {
      throw new Error(`Failed to sync to target: ${error.message}`)
    }
  }

  // Update job status in database
  private async updateJobStatus(job: SyncJob): Promise<void> {
    const { error } = await this.supabase
      .from('sync_jobs')
      .update({
        status: job.status,
        progress: job.progress,
        total_records: job.totalRecords,
        processed_records: job.processedRecords,
        failed_records: job.failedRecords,
        started_at: job.startedAt?.toISOString(),
        completed_at: job.completedAt?.toISOString(),
        error: job.error
      })
      .eq('id', job.id)

    if (error) {
      console.error(`Failed to update job status: ${error.message}`)
    }
  }

  // Trigger webhooks for sync completion
  private async triggerSyncWebhooks(job: SyncJob, config: SyncConfig): Promise<void> {
    // Get webhooks for sync events
    const { data: webhooks } = await this.supabase
      .from('webhooks')
      .select('*')
      .eq('tenant_id', job.tenantId)
      .eq('is_active', true)
      .contains('events', [`sync.completed`])

    if (!webhooks || webhooks.length === 0) return

    const payload = {
      event: 'sync.completed',
      data: {
        jobId: job.id,
        sourceSolution: job.sourceSolution,
        targetSolution: job.targetSolution,
        entityType: job.entityType,
        status: job.status,
        progress: job.progress,
        totalRecords: job.totalRecords,
        processedRecords: job.processedRecords,
        failedRecords: job.failedRecords,
        completedAt: job.completedAt
      }
    }

    // Trigger webhook handler
    await this.supabase.functions.invoke('webhook-handler', {
      body: {
        action: 'trigger-webhook',
        eventType: 'sync.completed',
        eventData: payload,
        tenantId: job.tenantId
      }
    })
  }

  // Process pending jobs
  private async processPendingJobs(): Promise<void> {
    const { data: jobs } = await this.supabase
      .from('sync_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10)

    if (!jobs) return

    for (const job of jobs) {
      if (!this.activeJobs.has(job.id)) {
        const syncJob: SyncJob = {
          id: job.id,
          tenantId: job.tenant_id,
          sourceSolution: job.source_solution,
          targetSolution: job.target_solution,
          entityType: job.entity_type,
          syncType: job.sync_type,
          status: job.status,
          progress: job.progress,
          totalRecords: job.total_records,
          processedRecords: job.processed_records,
          failedRecords: job.failed_records
        }
        
        this.activeJobs.set(job.id, syncJob)
        setImmediate(() => this.processJob(job.id))
      }
    }
  }

  // Retry failed jobs
  private async retryFailedJobs(): Promise<void> {
    const { data: jobs } = await this.supabase
      .from('sync_jobs')
      .select('*')
      .eq('status', 'failed')
      .lt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Only jobs older than 5 minutes
      .order('created_at', { ascending: true })
      .limit(5)

    if (!jobs) return

    for (const job of jobs) {
      // Reset job to pending for retry
      await this.supabase
        .from('sync_jobs')
        .update({
          status: 'pending',
          progress: 0,
          processed_records: 0,
          failed_records: 0,
          error: null
        })
        .eq('id', job.id)
    }
  }

  // Get job status
  async getJobStatus(jobId: string, tenantId: string): Promise<SyncJob | null> {
    // Set tenant context
    await this.supabase.rpc('set_tenant_context', { p_tenant_id: tenantId })

    const { data: job } = await this.supabase
      .from('sync_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('tenant_id', tenantId)
      .single()

    if (!job) return null

    return {
      id: job.id,
      tenantId: job.tenant_id,
      sourceSolution: job.source_solution,
      targetSolution: job.target_solution,
      entityType: job.entity_type,
      syncType: job.sync_type,
      status: job.status,
      progress: job.progress,
      totalRecords: job.total_records,
      processedRecords: job.processed_records,
      failedRecords: job.failed_records,
      startedAt: job.started_at ? new Date(job.started_at) : undefined,
      completedAt: job.completed_at ? new Date(job.completed_at) : undefined,
      error: job.error
    }
  }

  // Get sync history
  async getSyncHistory(tenantId: string, limit: number = 50): Promise<SyncJob[]> {
    // Set tenant context
    await this.supabase.rpc('set_tenant_context', { p_tenant_id: tenantId })

    const { data: jobs } = await this.supabase
      .from('sync_jobs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!jobs) return []

    return jobs.map(job => ({
      id: job.id,
      tenantId: job.tenant_id,
      sourceSolution: job.source_solution,
      targetSolution: job.target_solution,
      entityType: job.entity_type,
      syncType: job.sync_type,
      status: job.status,
      progress: job.progress,
      totalRecords: job.total_records,
      processedRecords: job.processed_records,
      failedRecords: job.failed_records,
      startedAt: job.started_at ? new Date(job.started_at) : undefined,
      completedAt: job.completed_at ? new Date(job.completed_at) : undefined,
      error: job.error
    }))
  }

  // Cancel a sync job
  async cancelSyncJob(jobId: string, tenantId: string): Promise<boolean> {
    // Set tenant context
    await this.supabase.rpc('set_tenant_context', { p_tenant_id: tenantId })

    const { error } = await this.supabase
      .from('sync_jobs')
      .update({ status: 'cancelled' })
      .eq('id', jobId)
      .eq('tenant_id', tenantId)
      .in('status', ['pending', 'running'])

    if (error) return false

    // Remove from active jobs
    this.activeJobs.delete(jobId)
    return true
  }
}

// Predefined sync configurations for common use cases
export const SYNC_CONFIGURATIONS = {
  // CRM to Inventory: Sync customer information
  CRM_TO_INVENTORY_CUSTOMERS: {
    sourceSolution: 'crm',
    targetSolution: 'inventory',
    entityType: 'customers',
    syncType: 'real-time' as const,
    fieldMappings: {
      'id': 'customer_id',
      'first_name': 'first_name',
      'last_name': 'last_name',
      'email': 'email',
      'phone': 'phone',
      'company': 'company',
      'address': 'address',
      'city': 'city',
      'state': 'state',
      'zip_code': 'zip_code',
      'country': 'country'
    }
  },

  // Inventory to POS: Sync product information
  INVENTORY_TO_POS_PRODUCTS: {
    sourceSolution: 'inventory',
    targetSolution: 'pos',
    entityType: 'products',
    syncType: 'batch' as const,
    fieldMappings: {
      'id': 'product_id',
      'name': 'name',
      'description': 'description',
      'sku': 'sku',
      'barcode': 'barcode',
      'price': 'price',
      'cost': 'cost',
      'images': 'images',
      'is_active': 'available'
    },
    transform: (data: any) => ({
      ...data,
      available: data.is_active && data.current_stock > 0
    })
  },

  // POS to Accounting: Sync sales data
  POS_TO_ACCOUNTING_SALES: {
    sourceSolution: 'pos',
    targetSolution: 'accounting',
    entityType: 'sales',
    syncType: 'batch' as const,
    fieldMappings: {
      'id': 'sale_id',
      'sale_number': 'reference_number',
      'total_amount': 'amount',
      'tax_amount': 'tax_amount',
      'created_at': 'transaction_date',
      'customer_id': 'customer_id'
    },
    transform: (data: any) => ({
      ...data,
      transaction_date: data.created_at.split('T')[0], // Convert to date only
      amount: data.total_amount,
      transaction_type: 'sale'
    })
  },

  // HR to Accounting: Sync payroll data
  HR_TO_ACCOUNTING_PAYROLL: {
    sourceSolution: 'hr',
    targetSolution: 'accounting',
    entityType: 'payroll',
    syncType: 'batch' as const,
    fieldMappings: {
      'id': 'payroll_id',
      'employee_id': 'employee_id',
      'gross_pay': 'gross_amount',
      'net_pay': 'net_amount',
      'pay_period_start': 'period_start',
      'pay_period_end': 'period_end'
    }
  }
}
