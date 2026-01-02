import { supabase } from '@/lib/supabase'
import { Review, ReviewFormData } from '@/types/review'
import { ReviewValidator, ValidationError } from '@/utils/validation'
import { logger } from '@/utils/logger'
import { cache } from '@/utils/cache'

export class ReviewService {
  private supabase = supabase
  private readonly CACHE_KEY_APPROVED = 'approved-reviews'
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
  private readonly RATE_LIMIT_MAX_ATTEMPTS = 3

  async submitReview(reviewData: ReviewFormData): Promise<{ success: boolean; error?: string; errors?: ValidationError[] }> {
    try {
      // Check if Supabase is configured
      if (!this.supabase) {
        logger.warn('Supabase not configured, review submission disabled')
        return { 
          success: false, 
          error: 'Review submission is currently unavailable. Please contact support.' 
        }
      }

      // Validate input
      const validationErrors = ReviewValidator.validate(reviewData)
      if (validationErrors.length > 0) {
        logger.warn('Review validation failed', { 
          errors: validationErrors,
          email: reviewData.email 
        })
        return { 
          success: false, 
          error: 'Please correct the errors in the form',
          errors: validationErrors
        }
      }

      // Sanitize input
      const sanitizedData = ReviewValidator.sanitize(reviewData)

      // Check rate limiting
      const rateLimitResult = await this.checkRateLimit(sanitizedData.email)
      if (!rateLimitResult.allowed) {
        logger.warn('Rate limit exceeded', { 
          email: sanitizedData.email,
          attempts: rateLimitResult.attempts 
        })
        return { 
          success: false, 
          error: 'Too many submission attempts. Please try again later.' 
        }
      }

      // Check for duplicate reviews
      const isDuplicate = await this.checkDuplicateReview(sanitizedData.review, sanitizedData.email)
      if (isDuplicate) {
        logger.warn('Duplicate review attempted', { 
          email: sanitizedData.email,
          reviewLength: sanitizedData.review.length 
        })
        return { 
          success: false, 
          error: 'This review appears to be a duplicate. Please submit a unique review.' 
        }
      }

      // Detect spam
      const spamCheck = ReviewValidator.detectSpam(sanitizedData.review)
      if (spamCheck.isSpam) {
        logger.warn('Spam review detected', { 
          email: sanitizedData.email,
          spamScore: spamCheck.score,
          reasons: spamCheck.reasons 
        })
        return { 
          success: false, 
          error: 'Your review could not be submitted. Please contact support if you believe this is an error.' 
        }
      }

      // Insert review
      const { data, error } = await this.supabase
        .from('reviews')
        .insert({
          ...sanitizedData,
          status: 'pending',
          spam_score: spamCheck.score,
          flagged: spamCheck.score > 30
        })
        .select()
        .single()

      if (error) {
        logger.error('Database error submitting review', {
          error: error.message,
          code: error.code,
          details: error.details,
          email: sanitizedData.email
        })
        return { 
          success: false, 
          error: 'Unable to submit review. Please try again later.' 
        }
      }

      logger.info('Review submitted successfully', {
        reviewId: data.id,
        email: sanitizedData.email,
        rating: sanitizedData.rating,
        spamScore: spamCheck.score
      })

      // Clear cache since new review might be approved
      cache.delete(this.CACHE_KEY_APPROVED)

      return { success: true }
    } catch (error) {
      logger.error('Unexpected error submitting review', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        email: reviewData.email
      })
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again later.' 
      }
    }
  }

  async getApprovedReviews(): Promise<Review[]> {
    try {
      // Check if Supabase is properly configured
      if (!this.supabase) {
        logger.info('Supabase not configured, using fallback testimonials')
        return []
      }

      // Check cache first
      const cached = cache.get<Review[]>(this.CACHE_KEY_APPROVED)
      if (cached) {
        logger.debug('Returning cached approved reviews', { count: cached.length })
        return cached
      }

      const { data, error } = await this.supabase
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .eq('flagged', false)
        .order('created_at', { ascending: false })
        .limit(50) // Reasonable limit for performance

      if (error) {
        // Handle common Supabase errors gracefully
        if (error.code === 'PGRST116') {
          logger.info('Reviews table does not exist yet, using fallback testimonials')
          return []
        }
        if (error.code === 'PGRST301') {
          logger.warn('Database connection issue, using fallback testimonials')
          return []
        }
        
        logger.warn('Database error fetching approved reviews, using fallback', {
          error: error.message,
          code: error.code
        })
        return []
      }

      const reviews = data || []
      
      // Cache the results
      cache.set(this.CACHE_KEY_APPROVED, reviews, this.CACHE_TTL)
      
      logger.info('Fetched approved reviews from database', { count: reviews.length })
      return reviews
    } catch (error) {
      // Handle network/connection errors
      if (error instanceof Error) {
        if (error.message.includes('fetch failed') || error.message.includes('ETIMEDOUT')) {
          logger.warn('Network error fetching reviews, using fallback testimonials', { error: error.message })
          return []
        }
      }
      
      logger.warn('Unexpected error fetching approved reviews, using fallback testimonials', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return []
    }
  }

  async getAllReviews(): Promise<Review[]> {
    try {
      // Check if Supabase is configured
      if (!this.supabase) {
        logger.info('Supabase not configured, admin dashboard disabled')
        return []
      }

      const { data, error } = await this.supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100) // Reasonable limit

      if (error) {
        logger.error('Database error fetching all reviews', {
          error: error.message,
          code: error.code
        })
        return []
      }

      logger.info('Fetched all reviews from database', { count: data?.length || 0 })
      return data || []
    } catch (error) {
      logger.error('Unexpected error fetching all reviews', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      return []
    }
  }

  async updateReviewStatus(reviewId: string, status: 'approved' | 'rejected'): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if Supabase is configured
      if (!this.supabase) {
        logger.warn('Supabase not configured, review status update disabled')
        return { 
          success: false, 
          error: 'Review management is currently unavailable.' 
        }
      }

      const { data, error } = await this.supabase
        .from('reviews')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select()
        .single()

      if (error) {
        logger.error('Database error updating review status', {
          error: error.message,
          code: error.code,
          reviewId,
          status
        })
        return { 
          success: false, 
          error: 'Failed to update review status.' 
        }
      }

      // Clear cache when review status changes
      cache.delete(this.CACHE_KEY_APPROVED)

      logger.info('Review status updated successfully', {
        reviewId,
        newStatus: status,
        reviewEmail: data?.email
      })

      return { success: true }
    } catch (error) {
      logger.error('Unexpected error updating review status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        reviewId,
        status
      })
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      }
    }
  }

  async deleteReview(reviewId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if Supabase is configured
      if (!this.supabase) {
        logger.warn('Supabase not configured, review deletion disabled')
        return { 
          success: false, 
          error: 'Review management is currently unavailable.' 
        }
      }

      // Get review details before deletion for logging
      const { data: reviewData } = await this.supabase
        .from('reviews')
        .select('email, name, rating')
        .eq('id', reviewId)
        .single()

      const { error } = await this.supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) {
        logger.error('Database error deleting review', {
          error: error.message,
          code: error.code,
          reviewId
        })
        return { 
          success: false, 
          error: 'Failed to delete review.' 
        }
      }

      // Clear cache
      cache.delete(this.CACHE_KEY_APPROVED)

      logger.info('Review deleted successfully', {
        reviewId,
        reviewEmail: reviewData?.email,
        reviewName: reviewData?.name,
        reviewRating: reviewData?.rating
      })

      return { success: true }
    } catch (error) {
      logger.error('Unexpected error deleting review', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        reviewId
      })
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      }
    }
  }

  private async checkRateLimit(email: string): Promise<{ allowed: boolean; attempts: number }> {
    try {
      // Check if Supabase is configured
      if (!this.supabase) {
        return { allowed: true, attempts: 0 }
      }

      const oneHourAgo = new Date(Date.now() - this.RATE_LIMIT_WINDOW).toISOString()
      
      const { data, error } = await this.supabase
        .from('reviews')
        .select('id')
        .eq('email', email)
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

  private async checkDuplicateReview(reviewText: string, email: string): Promise<boolean> {
    try {
      // Check if Supabase is configured
      if (!this.supabase) {
        return false
      }

      const { data, error } = await this.supabase
        .from('reviews')
        .select('id')
        .eq('email', email)
        .eq('review', reviewText.trim())
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

  // Admin method to get review statistics
  async getReviewStats(): Promise<{
    total: number
    approved: number
    pending: number
    rejected: number
    flagged: number
    averageRating: number
  }> {
    try {
      // Check if Supabase is configured
      if (!this.supabase) {
        return {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          flagged: 0,
          averageRating: 0
        }
      }

      const { data, error } = await this.supabase
        .from('reviews')
        .select('status, rating, flagged')

      if (error) {
        logger.error('Error fetching review stats', { error: error.message })
        return {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          flagged: 0,
          averageRating: 0
        }
      }

      const reviews = data || []
      const approvedReviews = reviews.filter(r => r.status === 'approved')
      
      return {
        total: reviews.length,
        approved: approvedReviews.length,
        pending: reviews.filter(r => r.status === 'pending').length,
        rejected: reviews.filter(r => r.status === 'rejected').length,
        flagged: reviews.filter(r => r.flagged).length,
        averageRating: approvedReviews.length > 0 
          ? approvedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / approvedReviews.length 
          : 0
      }
    } catch (error) {
      logger.error('Unexpected error fetching review stats', { error })
      return {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        flagged: 0,
        averageRating: 0
      }
    }
  }
}

export const reviewService = new ReviewService()
