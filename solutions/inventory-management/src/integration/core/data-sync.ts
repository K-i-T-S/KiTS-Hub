/**
 * KiTS Hub Data Synchronization Service
 * Handles data mapping, transformation, and synchronization between solutions
 */

export interface DataMapping {
  source_entity: string;
  target_entity: string;
  field_mappings: FieldMapping[];
  transformation_rules?: TransformationRule[];
  validation_rules?: ValidationRule[];
  conflict_resolution?: ConflictResolution;
}

export interface FieldMapping {
  source_field: string;
  target_field: string;
  required: boolean;
  default_value?: any;
  transform_function?: string;
}

export interface TransformationRule {
  type: 'format' | 'calculate' | 'lookup' | 'conditional' | 'custom';
  source_fields: string[];
  target_field: string;
  configuration: Record<string, any>;
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'custom';
  configuration: Record<string, any>;
  error_message: string;
}

export interface ConflictResolution {
  strategy: 'source_wins' | 'target_wins' | 'merge' | 'manual' | 'timestamp';
  merge_config?: Record<string, any>;
}

export interface SyncJob {
  id: string;
  tenant_id: string;
  source_solution: string;
  target_solution: string;
  entity_type: string;
  sync_type: 'full' | 'incremental' | 'real_time';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  total_records: number;
  processed_records: number;
  failed_records: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  metadata?: Record<string, any>;
}

export interface SyncRecord {
  id: string;
  job_id: string;
  source_id: string;
  target_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  source_data: any;
  target_data?: any;
  error_message?: string;
  created_at: string;
  processed_at?: string;
}

export interface DataConflict {
  id: string;
  job_id: string;
  record_id: string;
  field: string;
  source_value: any;
  target_value: any;
  conflict_type: 'value_mismatch' | 'missing_data' | 'format_mismatch' | 'validation_error';
  resolution?: 'source_wins' | 'target_wins' | 'merge' | 'manual';
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

export class DataSyncService {
  private static instance: DataSyncService;
  private mappings: Map<string, DataMapping[]> = new Map();
  private activeJobs: Map<string, SyncJob> = new Map();
  private jobQueue: SyncJob[] = [];
  private processing = false;

  private constructor() {
    this.initializeDefaultMappings();
    this.startJobProcessor();
  }

  static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  /**
   * Initialize default data mappings
   */
  private initializeDefaultMappings(): void {
    // Product mapping from Inventory to POS
    this.addMapping('inventory', 'pos', 'product', {
      source_entity: 'product',
      target_entity: 'pos_product',
      field_mappings: [
        { source_field: 'id', target_field: 'product_id', required: true },
        { source_field: 'name', target_field: 'name', required: true },
        { source_field: 'sku', target_field: 'sku', required: true },
        { source_field: 'price', target_field: 'price', required: true },
        { source_field: 'current_stock', target_field: 'stock_level', required: true },
        { source_field: 'category', target_field: 'category', required: false },
        { source_field: 'images', target_field: 'image_urls', required: false }
      ],
      conflict_resolution: { strategy: 'source_wins' }
    });

    // Customer mapping from CRM to POS
    this.addMapping('crm', 'pos', 'customer', {
      source_entity: 'customer',
      target_entity: 'pos_customer',
      field_mappings: [
        { source_field: 'id', target_field: 'customer_id', required: true },
        { source_field: 'name', target_field: 'name', required: true },
        { source_field: 'email', target_field: 'email', required: false },
        { source_field: 'phone', target_field: 'phone', required: false },
        { source_field: 'address', target_field: 'billing_address', required: false }
      ],
      conflict_resolution: { strategy: 'merge' }
    });

    // Sale mapping from POS to Analytics
    this.addMapping('pos', 'analytics', 'sale', {
      source_entity: 'sale',
      target_entity: 'analytics_sale',
      field_mappings: [
        { source_field: 'id', target_field: 'sale_id', required: true },
        { source_field: 'total_amount', target_field: 'revenue', required: true },
        { source_field: 'created_at', target_field: 'sale_date', required: true },
        { source_field: 'payment_method', target_field: 'payment_type', required: true }
      ],
      transformation_rules: [
        {
          type: 'calculate',
          source_fields: ['total_amount', 'tax_amount'],
          target_field: 'net_revenue',
          configuration: { operation: 'subtract' }
        }
      ],
      conflict_resolution: { strategy: 'timestamp' }
    });
  }

  /**
   * Add data mapping
   */
  addMapping(sourceSolution: string, targetSolution: string, entityType: string, mapping: DataMapping): void {
    const key = `${sourceSolution}-${targetSolution}-${entityType}`;
    const mappings = this.mappings.get(key) || [];
    mappings.push(mapping);
    this.mappings.set(key, mappings);
  }

  /**
   * Get data mapping
   */
  getMapping(sourceSolution: string, targetSolution: string, entityType: string): DataMapping | undefined {
    const key = `${sourceSolution}-${targetSolution}-${entityType}`;
    const mappings = this.mappings.get(key) || [];
    return mappings[0]; // Return first mapping for simplicity
  }

  /**
   * Create sync job
   */
  async createSyncJob(job: Omit<SyncJob, 'id' | 'status' | 'progress' | 'processed_records' | 'failed_records' | 'created_at'>): Promise<SyncJob> {
    const syncJob: SyncJob = {
      ...job,
      id: this.generateId(),
      status: 'pending',
      progress: 0,
      processed_records: 0,
      failed_records: 0,
      created_at: new Date().toISOString()
    };

    this.jobQueue.push(syncJob);
    return syncJob;
  }

  /**
   * Start job processor
   */
  private startJobProcessor(): void {
    setInterval(() => {
      if (!this.processing && this.jobQueue.length > 0) {
        this.processJobQueue();
      }
    }, 5000); // Process every 5 seconds
  }

  /**
   * Process job queue
   */
  private async processJobQueue(): Promise<void> {
    if (this.processing) return;
    
    this.processing = true;
    
    try {
      const pendingJobs = this.jobQueue.filter(job => job.status === 'pending');
      
      for (const job of pendingJobs) {
        await this.processSyncJob(job);
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process individual sync job
   */
  private async processSyncJob(job: SyncJob): Promise<void> {
    job.status = 'running';
    job.started_at = new Date().toISOString();
    this.activeJobs.set(job.id, job);

    try {
      const mapping = this.getMapping(job.source_solution, job.target_solution, job.entity_type);
      if (!mapping) {
        throw new Error(`No mapping found for ${job.source_solution} -> ${job.target_solution} : ${job.entity_type}`);
      }

      // Get source data (in production, this would query the source solution)
      const sourceData = await this.getSourceData(job);
      job.total_records = sourceData.length;

      // Process each record
      for (let i = 0; i < sourceData.length; i++) {
        const record = sourceData[i];
        await this.processRecord(job, mapping, record);
        
        job.processed_records++;
        job.progress = Math.round((job.processed_records / job.total_records) * 100);
        
        // Add delay to prevent overwhelming target system
        if (i % 100 === 0) {
          await this.sleep(100);
        }
      }

      job.status = 'completed';
      job.completed_at = new Date().toISOString();
    } catch (error) {
      job.status = 'failed';
      job.error_message = error.message;
      job.completed_at = new Date().toISOString();
    } finally {
      this.activeJobs.delete(job.id);
    }
  }

  /**
   * Process individual record
   */
  private async processRecord(job: SyncJob, mapping: DataMapping, sourceData: any): Promise<void> {
    const record: SyncRecord = {
      id: this.generateId(),
      job_id: job.id,
      source_id: sourceData.id,
      status: 'processing',
      source_data: sourceData,
      created_at: new Date().toISOString()
    };

    try {
      // Transform data according to mapping
      const transformedData = this.transformData(sourceData, mapping);
      
      // Validate transformed data
      this.validateData(transformedData, mapping);
      
      // Check for conflicts
      const conflicts = await this.detectConflicts(job, mapping, transformedData);
      
      if (conflicts.length > 0) {
        // Handle conflicts based on resolution strategy
        const resolvedData = await this.resolveConflicts(conflicts, mapping, transformedData);
        record.target_data = resolvedData;
      } else {
        record.target_data = transformedData;
      }

      // Send data to target solution (in production, this would call target API)
      await this.sendToTarget(job, record.target_data);
      
      record.status = 'completed';
      record.processed_at = new Date().toISOString();
    } catch (error) {
      record.status = 'failed';
      record.error_message = error.message;
      job.failed_records++;
    }

    // Store record (in production, this would save to database)
    return record;
  }

  /**
   * Transform data according to mapping rules
   */
  private transformData(sourceData: any, mapping: DataMapping): any {
    const transformed: any = {};

    // Apply field mappings
    mapping.field_mappings.forEach(fieldMapping => {
      let value = sourceData[fieldMapping.source_field];
      
      if (value === undefined || value === null) {
        if (fieldMapping.required) {
          throw new Error(`Required field ${fieldMapping.source_field} is missing`);
        }
        value = fieldMapping.default_value;
      }

      // Apply transformation function if specified
      if (fieldMapping.transform_function) {
        value = this.applyTransformation(value, fieldMapping.transform_function);
      }

      transformed[fieldMapping.target_field] = value;
    });

    // Apply transformation rules
    if (mapping.transformation_rules) {
      mapping.transformation_rules.forEach(rule => {
        transformed[rule.target_field] = this.applyTransformationRule(sourceData, rule);
      });
    }

    return transformed;
  }

  /**
   * Apply transformation function
   */
  private applyTransformation(value: any, functionName: string): any {
    switch (functionName) {
      case 'uppercase':
        return typeof value === 'string' ? value.toUpperCase() : value;
      case 'lowercase':
        return typeof value === 'string' ? value.toLowerCase() : value;
      case 'trim':
        return typeof value === 'string' ? value.trim() : value;
      case 'to_number':
        return Number(value);
      case 'to_string':
        return String(value);
      case 'to_date':
        return new Date(value).toISOString();
      default:
        return value;
    }
  }

  /**
   * Apply transformation rule
   */
  private applyTransformationRule(sourceData: any, rule: TransformationRule): any {
    const values = rule.source_fields.map(field => sourceData[field]);

    switch (rule.type) {
      case 'calculate':
        return this.performCalculation(values, rule.configuration);
      case 'format':
        return this.formatValue(values[0], rule.configuration);
      case 'lookup':
        return this.performLookup(values[0], rule.configuration);
      case 'conditional':
        return this.performConditional(values, rule.configuration);
      default:
        return values[0];
    }
  }

  /**
   * Perform calculation
   */
  private performCalculation(values: any[], config: Record<string, any>): any {
    const operation = config.operation;
    
    switch (operation) {
      case 'add':
        return values.reduce((sum, val) => sum + Number(val), 0);
      case 'subtract':
        return values.reduce((result, val, index) => index === 0 ? Number(val) : result - Number(val), 0);
      case 'multiply':
        return values.reduce((product, val) => product * Number(val), 1);
      case 'divide':
        return values.reduce((result, val, index) => index === 0 ? Number(val) : result / Number(val));
      default:
        return values[0];
    }
  }

  /**
   * Format value
   */
  private formatValue(value: any, config: Record<string, any>): any {
    const format = config.format;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: config.currency || 'USD' }).format(value);
      case 'percentage':
        return `${Number(value) * 100}%`;
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      default:
        return value;
    }
  }

  /**
   * Perform lookup
   */
  private performLookup(value: any, config: Record<string, any>): any {
    // In production, this would perform database lookup or API call
    const lookupTable = config.lookup_table || {};
    return lookupTable[value] || value;
  }

  /**
   * Perform conditional logic
   */
  private performConditional(values: any[], config: Record<string, any>): any {
    const condition = config.condition;
    const trueValue = config.true_value;
    const falseValue = config.false_value;
    
    let result = false;
    
    switch (condition.operator) {
      case 'equals':
        result = values[0] === condition.value;
        break;
      case 'greater_than':
        result = Number(values[0]) > Number(condition.value);
        break;
      case 'less_than':
        result = Number(values[0]) < Number(condition.value);
        break;
      case 'contains':
        result = String(values[0]).includes(String(condition.value));
        break;
      default:
        result = false;
    }
    
    return result ? trueValue : falseValue;
  }

  /**
   * Validate data
   */
  private validateData(data: any, mapping: DataMapping): void {
    if (!mapping.validation_rules) return;

    mapping.validation_rules.forEach(rule => {
      const value = data[rule.field];
      
      switch (rule.type) {
        case 'required':
          if (value === undefined || value === null || value === '') {
            throw new Error(`Validation failed: ${rule.field} is required`);
          }
          break;
        case 'format':
          if (!this.validateFormat(value, rule.configuration)) {
            throw new Error(`Validation failed: ${rule.field} format is invalid - ${rule.error_message}`);
          }
          break;
        case 'range':
          if (!this.validateRange(value, rule.configuration)) {
            throw new Error(`Validation failed: ${rule.field} is out of range - ${rule.error_message}`);
          }
          break;
      }
    });
  }

  /**
   * Validate format
   */
  private validateFormat(value: any, config: Record<string, any>): boolean {
    const format = config.format;
    
    switch (format) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'phone':
        return /^\+?[1-9]\d{1,14}$/.test(value);
      case 'url':
        return /^https?:\/\/.+/.test(value);
      case 'uuid':
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
      default:
        return true;
    }
  }

  /**
   * Validate range
   */
  private validateRange(value: any, config: Record<string, any>): boolean {
    const numValue = Number(value);
    const min = config.min;
    const max = config.max;
    
    if (min !== undefined && numValue < min) return false;
    if (max !== undefined && numValue > max) return false;
    
    return true;
  }

  /**
   * Detect conflicts
   */
  private async detectConflicts(job: SyncJob, mapping: DataMapping, data: any): Promise<DataConflict[]> {
    // In production, this would check target system for existing data
    // For demo, returning no conflicts
    return [];
  }

  /**
   * Resolve conflicts
   */
  private async resolveConflicts(conflicts: DataConflict[], mapping: DataMapping, data: any): Promise<any> {
    if (!mapping.conflict_resolution) return data;

    const strategy = mapping.conflict_resolution.strategy;
    
    switch (strategy) {
      case 'source_wins':
        return data;
      case 'target_wins':
        // In production, would fetch target data
        return data;
      case 'merge':
        return this.mergeData(data, {}, mapping.conflict_resolution.merge_config);
      case 'timestamp':
        // In production, would compare timestamps
        return data;
      default:
        return data;
    }
  }

  /**
   * Merge data
   */
  private mergeData(sourceData: any, targetData: any, config?: Record<string, any>): any {
    // Simple merge strategy - in production would be more sophisticated
    return { ...targetData, ...sourceData };
  }

  /**
   * Get source data (mock implementation)
   */
  private async getSourceData(job: SyncJob): Promise<any[]> {
    // In production, this would query the source solution's API
    // For demo, returning mock data
    return [
      { id: '1', name: 'Test Product', sku: 'TEST-001', price: 99.99, current_stock: 100 },
      { id: '2', name: 'Another Product', sku: 'TEST-002', price: 49.99, current_stock: 50 }
    ];
  }

  /**
   * Send data to target (mock implementation)
   */
  private async sendToTarget(job: SyncJob, data: any): Promise<void> {
    // In production, this would call the target solution's API
    // For demo, just logging
    console.log(`Sending data to ${job.target_solution}:`, data);
  }

  /**
   * Get sync job status
   */
  getJobStatus(jobId: string): SyncJob | undefined {
    return this.activeJobs.get(jobId) || this.jobQueue.find(job => job.id === jobId);
  }

  /**
   * Get all jobs for tenant
   */
  getTenantJobs(tenantId: string): SyncJob[] {
    return [...this.jobQueue, ...Array.from(this.activeJobs.values())]
      .filter(job => job.tenant_id === tenantId);
  }

  /**
   * Cancel sync job
   */
  cancelJob(jobId: string): boolean {
    const job = this.activeJobs.get(jobId) || this.jobQueue.find(job => job.id === jobId);
    if (!job) return false;

    job.status = 'cancelled';
    job.completed_at = new Date().toISOString();
    this.activeJobs.delete(jobId);
    
    return true;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
