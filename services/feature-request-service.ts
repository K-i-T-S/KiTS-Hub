import { supabase } from '@/lib/supabase'
import { 
  FeatureRequest, 
  FeatureRequestFormData, 
  FeatureRequestServiceResponse, 
  FeatureRequestStats,
  FeatureRequestFilters,
  ValidationError 
} from '@/types/feature-request'
import { logger } from '@/lib/logger'
import { cache } from '@/utils/cache'

export class FeatureRequestService {
  private supabase = supabase
  private readonly CACHE_KEY_PUBLIC = 'public-feature-requests'
  private readonly CACHE_KEY_STATS = 'feature-request-stats'
  private readonly CACHE_TTL = 10 * 60 * 1000 // 10 minutes
  private readonly RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
  private readonly RATE_LIMIT_MAX_ATTEMPTS = 5

  async submitFeatureRequest(requestData: FeatureRequestFormData): Promise<FeatureRequestServiceResponse> {
    try {
      // Check if Supabase is configured
      if (!this.supabase) {
        logger.warn('Supabase not configured, feature request submission disabled')
        return { 
          success: false, 
          error: 'Feature request submission is currently unavailable. Please contact support.' 
        }
      }

      // Validate input
      const validationErrors = this.validateFeatureRequest(requestData)
      if (validationErrors.length > 0) {
        logger.warn('Feature request validation failed', { 
          errors: validationErrors,
          email: requestData.requester_email 
        })
        return { 
          success: false, 
          error: 'Please correct the errors in the form',
          errors: validationErrors
        }
      }

      // Sanitize input
      const sanitizedData = this.sanitizeFeatureRequest(requestData)

      // Check rate limiting
      const rateLimitResult = await this.checkRateLimit(sanitizedData.requester_email)
      if (!rateLimitResult.allowed) {
        logger.warn('Rate limit exceeded for feature requests', { 
          email: sanitizedData.requester_email,
          attempts: rateLimitResult.attempts 
        })
        return { 
          success: false, 
          error: 'Too many feature request submissions. Please try again later.' 
        }
      }

      // Check for duplicate requests
      const isDuplicate = await this.checkDuplicateRequest(sanitizedData.title, sanitizedData.requester_email)
      if (isDuplicate) {
        logger.warn('Duplicate feature request attempted', { 
          email: sanitizedData.requester_email,
          title: sanitizedData.title 
        })
        return { 
          success: false, 
          error: 'A similar feature request already exists. Please check existing requests before submitting.' 
        }
      }

      // Insert feature request
      const { data, error } = await this.supabase
        .from('feature_requests')
        .insert({
          ...sanitizedData,
          status: 'pending',
          upvotes: 0,
          views: 0
        })
        .select()
        .single()

      if (error) {
        logger.error('Database error submitting feature request', {
          error: error.message,
          code: error.code,
          details: error.details,
          email: sanitizedData.requester_email
        })
        return { 
          success: false, 
          error: 'Unable to submit feature request. Please try again later.' 
        }
      }

      logger.info('Feature request submitted successfully', {
        requestId: data.id,
        email: sanitizedData.requester_email,
        category: sanitizedData.category,
        priority: sanitizedData.priority
      })

      // Clear cache since new request might affect public listings
      cache.delete(this.CACHE_KEY_PUBLIC)
      cache.delete(this.CACHE_KEY_STATS)

      return { success: true, data }
    } catch (error) {
      logger.error('Unexpected error submitting feature request', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        email: requestData.requester_email
      })
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again later.' 
      }
    }
  }

  async getPublicFeatureRequests(filters: FeatureRequestFilters = {}): Promise<FeatureRequest[]> {
    try {
      // Check if Supabase is properly configured
      if (!this.supabase) {
        logger.info('Supabase not configured, returning empty feature requests')
        return []
      }

      // Build query
      let query = this.supabase
        .from('feature_requests')
        .select('*')
        .in('status', ['pending', 'under_review', 'planned', 'in_progress', 'completed'])

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }
      
      if (filters.category && filters.category.length > 0) {
        query = query.in('category', filters.category)
      }
      
      if (filters.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority)
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      // Apply sorting
      const sortBy = filters.sort_by || 'created_at'
      const sortOrder = filters.sort_order || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit)
      }
      
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        // Handle common Supabase errors gracefully
        if (error.code === 'PGRST116') {
          logger.info('Feature requests table does not exist yet')
          return []
        }
        if (error.code === 'PGRST301') {
          logger.warn('Database connection issue')
          return []
        }
        
        logger.warn('Database error fetching public feature requests', {
          error: error.message,
          code: error.code
        })
        return []
      }

      const requests = data || []
      logger.info('Fetched public feature requests from database', { count: requests.length })
      return requests
    } catch (error) {
      // Handle network/connection errors
      if (error instanceof Error) {
        if (error.message.includes('fetch failed') || error.message.includes('ETIMEDOUT')) {
          logger.warn('Network error fetching feature requests', { error: error.message })
          return []
        }
      }
      
      logger.warn('Unexpected error fetching public feature requests', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return []
    }
  }

  async getAllFeatureRequests(): Promise<FeatureRequest[]> {
    try {
      // Check if Supabase is configured
      if (!this.supabase) {
        logger.info('Supabase not configured, admin dashboard disabled')
        return []
      }

      const { data, error } = await this.supabase
        .from('feature_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200) // Reasonable limit

      if (error) {
        logger.error('Database error fetching all feature requests', {
          error: error.message,
          code: error.code
        })
        return []
      }

      logger.info('Fetched all feature requests from database', { count: data?.length || 0 })
      return data || []
    } catch (error) {
      logger.error('Unexpected error fetching all feature requests', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      return []
    }
  }

  async updateFeatureRequestStatus(
    requestId: string, 
    status: FeatureRequest['status'],
    adminNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if Supabase is configured
      if (!this.supabase) {
        logger.warn('Supabase not configured, feature request status update disabled')
        return { 
          success: false, 
          error: 'Feature request management is currently unavailable.' 
        }
      }

      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      }

      if (adminNotes) {
        updateData.admin_notes = adminNotes
      }

      if (status === 'completed') {
        updateData.actual_completion_date = new Date().toISOString()
      }

      const { data, error } = await this.supabase
        .from('feature_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single()

      if (error) {
        logger.error('Database error updating feature request status', {
          error: error.message,
          code: error.code,
          requestId,
          status
        })
        return { 
          success: false, 
          error: 'Failed to update feature request status.' 
        }
      }

      // Clear cache when request status changes
      cache.delete(this.CACHE_KEY_PUBLIC)
      cache.delete(this.CACHE_KEY_STATS)

      logger.info('Feature request status updated successfully', {
        requestId,
        newStatus: status,
        requestEmail: data?.requester_email
      })

      return { success: true }
    } catch (error) {
      logger.error('Unexpected error updating feature request status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        requestId,
        status
      })
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      }
    }
  }

  async deleteFeatureRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if Supabase is configured
      if (!this.supabase) {
        logger.warn('Supabase not configured, feature request deletion disabled')
        return { 
          success: false, 
          error: 'Feature request management is currently unavailable.' 
        }
      }

      // Get request details before deletion for logging
      const { data: requestData } = await this.supabase
        .from('feature_requests')
        .select('title, requester_email, category')
        .eq('id', requestId)
        .single()

      const { error } = await this.supabase
        .from('feature_requests')
        .delete()
        .eq('id', requestId)

      if (error) {
        logger.error('Database error deleting feature request', {
          error: error.message,
          code: error.code,
          requestId
        })
        return { 
          success: false, 
          error: 'Failed to delete feature request.' 
        }
      }

      // Clear cache
      cache.delete(this.CACHE_KEY_PUBLIC)
      cache.delete(this.CACHE_KEY_STATS)

      logger.info('Feature request deleted successfully', {
        requestId,
        requestTitle: requestData?.title,
        requestEmail: requestData?.requester_email,
        requestCategory: requestData?.category
      })

      return { success: true }
    } catch (error) {
      logger.error('Unexpected error deleting feature request', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        requestId
      })
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      }
    }
  }

  async getFeatureRequestStats(): Promise<FeatureRequestStats> {
    try {
      // Check if Supabase is configured
      if (!this.supabase) {
        return this.getEmptyStats()
      }

      // Check cache first
      const cached = cache.get<FeatureRequestStats>(this.CACHE_KEY_STATS)
      if (cached) {
        logger.debug('Returning cached feature request stats')
        return cached
      }

      const { data, error } = await this.supabase
        .from('feature_requests')
        .select('status, category, priority, upvotes, created_at, actual_completion_date')

      if (error) {
        logger.error('Error fetching feature request stats', { error: error.message })
        return this.getEmptyStats()
      }

      const requests = data || []
      
      // Calculate statistics
      const stats: FeatureRequestStats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        under_review: requests.filter(r => r.status === 'under_review').length,
        planned: requests.filter(r => r.status === 'planned').length,
        in_progress: requests.filter(r => r.status === 'in_progress').length,
        completed: requests.filter(r => r.status === 'completed').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
        duplicate: requests.filter(r => r.status === 'duplicate').length,
        by_category: this.groupByField(requests, 'category'),
        by_priority: this.groupByField(requests, 'priority'),
        total_upvotes: requests.reduce((sum, r) => sum + (r.upvotes || 0), 0)
      }

      // Calculate average completion time
      const completedRequests = requests.filter(r => r.status === 'completed' && r.actual_completion_date)
      if (completedRequests.length > 0) {
        const totalDays = completedRequests.reduce((sum, r) => {
          const created = new Date(r.created_at)
          const completed = new Date(r.actual_completion_date!)
          return sum + Math.ceil((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
        }, 0)
        stats.average_completion_days = Math.round(totalDays / completedRequests.length)
      }

      // Cache the results
      cache.set(this.CACHE_KEY_STATS, stats, this.CACHE_TTL)
      
      logger.info('Fetched feature request stats from database', { total: stats.total })
      return stats
    } catch (error) {
      logger.error('Unexpected error fetching feature request stats', { error })
      return this.getEmptyStats()
    }
  }

  async toggleUpvote(requestId: string, userEmail: string, userName?: string): Promise<{ success: boolean; error?: string; upvoted?: boolean; totalUpvotes?: number }> {
    try {
      if (!this.supabase) {
        return { success: false, error: 'Upvoting is currently unavailable.' }
      }

      const { data, error } = await this.supabase
        .rpc('toggle_feature_request_upvote', { 
          request_id: requestId, 
          user_email: userEmail, 
          user_name: userName 
        })

      if (error) {
        logger.error('Error toggling upvote', { error: error.message, requestId, userEmail })
        return { success: false, error: 'Failed to toggle upvote.' }
      }

      // Clear cache
      cache.delete(this.CACHE_KEY_PUBLIC)

      logger.info('Upvote toggled successfully', { requestId, userEmail, upvoted: data?.upvoted })
      
      return { 
        success: true, 
        upvoted: data?.upvoted, 
        totalUpvotes: data?.total_upvotes 
      }
    } catch (error) {
      logger.error('Unexpected error toggling upvote', { error, requestId, userEmail })
      return { success: false, error: 'An unexpected error occurred.' }
    }
  }

  async incrementViews(requestId: string): Promise<{ success: boolean }> {
    try {
      if (!this.supabase) {
        return { success: false }
      }

      const { error } = await this.supabase
        .rpc('increment_feature_request_views', { request_id: requestId })

      if (error) {
        logger.error('Error incrementing views', { error: error.message, requestId })
      }

      return { success: !error }
    } catch (error) {
      logger.error('Unexpected error incrementing views', { error, requestId })
      return { success: false }
    }
  }

  private validateFeatureRequest(data: FeatureRequestFormData): ValidationError[] {
    const errors: ValidationError[] = []

    // Title validation
    if (!data.title || data.title.trim().length < 5) {
      errors.push({ field: 'title', message: 'Title must be at least 5 characters long' })
    }
    if (data.title && data.title.length > 200) {
      errors.push({ field: 'title', message: 'Title must be less than 200 characters' })
    }

    // Description validation
    if (!data.description || data.description.trim().length < 50) {
      errors.push({ field: 'description', message: 'Description must be at least 50 characters long' })
    }
    if (data.description && data.description.length > 2000) {
      errors.push({ field: 'description', message: 'Description must be less than 2000 characters' })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!data.requester_email || !emailRegex.test(data.requester_email)) {
      errors.push({ field: 'requester_email', message: 'Please enter a valid email address' })
    }

    // Name validation
    if (!data.requester_name || data.requester_name.trim().length < 2) {
      errors.push({ field: 'requester_name', message: 'Name must be at least 2 characters long' })
    }

    // Category validation
    const validCategories = ['feature', 'bug_fix', 'enhancement', 'integration', 'ui_ux', 'performance', 'security', 'other']
    if (!data.category || !validCategories.includes(data.category)) {
      errors.push({ field: 'category', message: 'Please select a valid category' })
    }

    // Priority validation
    const validPriorities = ['low', 'medium', 'high', 'critical']
    if (!data.priority || !validPriorities.includes(data.priority)) {
      errors.push({ field: 'priority', message: 'Please select a valid priority' })
    }

    return errors
  }

  private sanitizeFeatureRequest(data: FeatureRequestFormData): FeatureRequestFormData {
    return {
      ...data,
      title: data.title.trim(),
      description: data.description.trim(),
      requester_name: data.requester_name.trim(),
      requester_email: data.requester_email.trim().toLowerCase(),
      company: data.company?.trim() || undefined,
      use_case: data.use_case?.trim() || undefined,
      expected_impact: data.expected_impact?.trim() || undefined,
      technical_details: data.technical_details?.trim() || undefined
    }
  }

  private async checkRateLimit(email: string): Promise<{ allowed: boolean; attempts: number }> {
    try {
      if (!this.supabase) {
        return { allowed: true, attempts: 0 }
      }

      const oneHourAgo = new Date(Date.now() - this.RATE_LIMIT_WINDOW).toISOString()
      
      const { data, error } = await this.supabase
        .from('feature_requests')
        .select('id')
        .eq('requester_email', email)
        .gte('created_at', oneHourAgo)

      if (error) {
        logger.error('Rate limit check failed', { error: error.message, email })
        return { allowed: true, attempts: 0 } // Fail open
      }

      const attempts = data?.length || 0
      const allowed = attempts < this.RATE_LIMIT_MAX_ATTEMPTS

      return { allowed, attempts }
    } catch (error) {
      logger.error('Unexpected error in rate limit check', { error, email })
      return { allowed: true, attempts: 0 } // Fail open
    }
  }

  private async checkDuplicateRequest(title: string, email: string): Promise<boolean> {
    try {
      if (!this.supabase) {
        return false
      }

      const { data, error } = await this.supabase
        .from('feature_requests')
        .select('id')
        .eq('requester_email', email)
        .eq('title', title.trim())
        .limit(1)

      if (error) {
        logger.error('Duplicate check failed', { error: error.message, email })
        return false // Fail open
      }

      return (data?.length || 0) > 0
    } catch (error) {
      logger.error('Unexpected error in duplicate check', { error, email })
      return false // Fail open
    }
  }

  private groupByField(requests: any[], field: string): Record<string, number> {
    return requests.reduce((acc, request) => {
      const key = request[field] || 'unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private getEmptyStats(): FeatureRequestStats {
    return {
      total: 0,
      pending: 0,
      under_review: 0,
      planned: 0,
      in_progress: 0,
      completed: 0,
      rejected: 0,
      duplicate: 0,
      by_category: {},
      by_priority: {},
      total_upvotes: 0
    }
  }
}

export const featureRequestService = new FeatureRequestService()
