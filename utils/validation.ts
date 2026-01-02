import { ReviewFormData } from '@/types/review'

export interface ValidationError {
  field: string
  message: string
}

export class ReviewValidator {
  static validate(data: ReviewFormData): ValidationError[] {
    const errors: ValidationError[] = []

    // Name validation
    if (!data.name?.trim()) {
      errors.push({ field: 'name', message: 'Name is required' })
    } else if (data.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters' })
    } else if (data.name.trim().length > 255) {
      errors.push({ field: 'name', message: 'Name must be less than 255 characters' })
    } else if (!/^[a-zA-Z\s\-'\.]+$/.test(data.name.trim())) {
      errors.push({ field: 'name', message: 'Name contains invalid characters' })
    }

    // Email validation
    if (!data.email?.trim()) {
      errors.push({ field: 'email', message: 'Email is required' })
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email.trim())) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' })
      } else if (data.email.trim().length > 255) {
        errors.push({ field: 'email', message: 'Email must be less than 255 characters' })
      }
    }

    // Company validation (optional)
    if (data.company?.trim()) {
      if (data.company.trim().length > 255) {
        errors.push({ field: 'company', message: 'Company name must be less than 255 characters' })
      }
    }

    // Title validation (optional)
    if (data.title?.trim()) {
      if (data.title.trim().length > 255) {
        errors.push({ field: 'title', message: 'Title must be less than 255 characters' })
      }
    }

    // Review validation
    if (!data.review?.trim()) {
      errors.push({ field: 'review', message: 'Review is required' })
    } else {
      const trimmedReview = data.review.trim()
      if (trimmedReview.length < 10) {
        errors.push({ field: 'review', message: 'Review must be at least 10 characters' })
      } else if (trimmedReview.length > 2000) {
        errors.push({ field: 'review', message: 'Review must be less than 2000 characters' })
      }
    }

    // Rating validation
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      errors.push({ field: 'rating', message: 'Please select a rating' })
    }

    return errors
  }

  static sanitize(data: ReviewFormData): ReviewFormData {
    return {
      name: data.name?.trim().replace(/[<>]/g, '') || '',
      email: data.email?.trim().toLowerCase() || '',
      company: data.company?.trim().replace(/[<>]/g, '') || '',
      title: data.title?.trim().replace(/[<>]/g, '') || '',
      review: data.review?.trim().replace(/[<>]/g, '') || '',
      rating: Math.max(1, Math.min(5, parseInt(data.rating.toString()) || 0))
    }
  }

  static detectSpam(content: string): { isSpam: boolean; score: number; reasons: string[] } {
    const reasons: string[] = []
    let score = 0

    const spamKeywords = [
      'click here', 'buy now', 'free money', 'guarantee', 'risk free',
      'limited time', 'act now', 'special promotion', 'winner', 'congratulations',
      'viagra', 'cialis', 'lottery', 'casino', 'poker', 'betting'
    ]

    const lowerContent = content.toLowerCase()

    // Check for spam keywords
    spamKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        score += 20
        reasons.push(`Contains spam keyword: ${keyword}`)
      }
    })

    // Check for excessive capitalization
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length
    if (capsRatio > 0.5) {
      score += 15
      reasons.push('Excessive capitalization')
    }

    // Check for excessive punctuation
    const punctuationCount = (content.match(/[!?.]/g) || []).length
    if (punctuationCount > content.length / 20) {
      score += 10
      reasons.push('Excessive punctuation')
    }

    // Check for repetitive content
    const words = content.toLowerCase().split(/\s+/)
    const uniqueWords = new Set(words)
    if (uniqueWords.size < words.length * 0.3) {
      score += 25
      reasons.push('Repetitive content')
    }

    // Check for URLs
    if (/https?:\/\/|www\./i.test(content)) {
      score += 30
      reasons.push('Contains URLs')
    }

    return {
      isSpam: score >= 50,
      score,
      reasons
    }
  }
}
