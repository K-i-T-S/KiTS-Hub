"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Star, X, Send, AlertCircle } from "lucide-react"
import { reviewService } from "@/services/review-service"
import { ValidationError } from "@/utils/validation"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ReviewModal({ isOpen, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    title: "",
    review: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setValidationErrors([])

    if (rating === 0) {
      setError("Please select a rating")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const result = await reviewService.submitReview({
        ...formData,
        rating
      })
      
      if (result.success) {
        // Reset form
        setFormData({
          name: "",
          email: "",
          company: "",
          title: "",
          review: ""
        })
        setRating(0)
        setIsSubmitting(false)
        onClose()
        
        // Show success message
        alert("Thank you for your review! It has been submitted for approval.")
      } else {
        if (result.errors) {
          setValidationErrors(result.errors)
        }
        setError(result.error || "Failed to submit review")
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      setError("Unable to submit review at this time. Please try again later.")
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear errors when user starts typing
    if (error || validationErrors.length > 0) {
      setError(null)
      setValidationErrors([])
    }
  }

  const handleRatingKeyDown = (e: React.KeyboardEvent, starValue: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setRating(starValue)
    }
  }

  const getFieldError = (fieldName: string): string | undefined => {
    const fieldError = validationErrors.find(err => err.field === fieldName)
    return fieldError?.message
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />
      
      {/* Modal */}
      <div 
        className="relative bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 id="review-modal-title" className="text-2xl font-bold text-white">
            Share Your Experience
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
          {/* Error Messages */}
          {error && (
            <div 
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              How would you rate KiTS Hub?
              <span className="text-red-400 ml-1" aria-label="Required">*</span>
            </label>
            <div className="flex gap-2" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onKeyDown={(e) => handleRatingKeyDown(e, star)}
                  aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                  aria-pressed={rating >= star}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-zinc-600"
                    } transition-colors`}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-2 text-sm text-zinc-400" aria-live="polite">
                You rated {rating} star{rating !== 1 ? "s" : ""}
              </p>
            )}
            {rating === 0 && getFieldError('rating') && (
              <p className="mt-2 text-sm text-red-400" role="alert">
                {getFieldError('rating')}
              </p>
            )}
          </div>

          {/* Personal Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                Full Name
                <span className="text-red-400 ml-1" aria-label="Required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                aria-invalid={!!getFieldError('name')}
                aria-describedby={getFieldError('name') ? 'name-error' : undefined}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="John Doe"
                maxLength={255}
              />
              {getFieldError('name') && (
                <p id="name-error" className="mt-2 text-sm text-red-400" role="alert">
                  {getFieldError('name')}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                Email Address
                <span className="text-red-400 ml-1" aria-label="Required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                aria-invalid={!!getFieldError('email')}
                aria-describedby={getFieldError('email') ? 'email-error' : undefined}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="john@company.com"
                maxLength={255}
              />
              {getFieldError('email') && (
                <p id="email-error" className="mt-2 text-sm text-red-400" role="alert">
                  {getFieldError('email')}
                </p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-zinc-300 mb-2">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                aria-invalid={!!getFieldError('company')}
                aria-describedby={getFieldError('company') ? 'company-error' : undefined}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="Company Inc."
                maxLength={255}
              />
              {getFieldError('company') && (
                <p id="company-error" className="mt-2 text-sm text-red-400" role="alert">
                  {getFieldError('company')}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-2">
                Job Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                aria-invalid={!!getFieldError('title')}
                aria-describedby={getFieldError('title') ? 'title-error' : undefined}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="CEO, Manager, etc."
                maxLength={255}
              />
              {getFieldError('title') && (
                <p id="title-error" className="mt-2 text-sm text-red-400" role="alert">
                  {getFieldError('title')}
                </p>
              )}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label htmlFor="review" className="block text-sm font-medium text-zinc-300 mb-2">
              Your Review
              <span className="text-red-400 ml-1" aria-label="Required">*</span>
            </label>
            <div className="relative">
              <textarea
                id="review"
                name="review"
                value={formData.review}
                onChange={handleChange}
                required
                rows={4}
                minLength={10}
                maxLength={2000}
                aria-invalid={!!getFieldError('review')}
                aria-describedby={getFieldError('review') ? 'review-error' : 'review-help'}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                placeholder="Tell us about your experience with KiTS Hub..."
              />
              <div className="absolute bottom-2 right-2 text-xs text-zinc-500">
                {formData.review.length}/2000
              </div>
            </div>
            <p id="review-help" className="mt-1 text-xs text-zinc-500">
              Minimum 10 characters, maximum 2000 characters
            </p>
            {getFieldError('review') && (
              <p id="review-error" className="mt-2 text-sm text-red-400" role="alert">
                {getFieldError('review')}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-[#9333ea] via-[#a855f7] to-[#7c3aed] hover:from-[#7c3aed] hover:via-[#9333ea] hover:to-[#6b21a8] text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
