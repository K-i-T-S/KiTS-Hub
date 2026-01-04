"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Send, AlertCircle, Lightbulb, Zap, Shield, Rocket, Palette, Cpu, Lock, MoreHorizontal } from "lucide-react"
import { featureRequestService } from "@/services/feature-request-service"
import { ValidationError } from "@/utils/validation"
import { 
  FEATURE_REQUEST_CATEGORIES, 
  FEATURE_REQUEST_PRIORITIES,
  FeatureRequestFormData 
} from "@/types/feature-request"

interface FeatureRequestModalProps {
  isOpen: boolean
  onClose: () => void
}

const categoryIcons: Record<string, any> = {
  feature: Lightbulb,
  bug_fix: Zap,
  enhancement: Rocket,
  integration: Cpu,
  ui_ux: Palette,
  performance: Zap,
  security: Shield,
  other: MoreHorizontal
}

export function FeatureRequestModal({ isOpen, onClose }: FeatureRequestModalProps) {
  const [formData, setFormData] = useState<FeatureRequestFormData>({
    title: "",
    description: "",
    category: "feature",
    priority: "medium",
    requester_name: "",
    requester_email: "",
    company: "",
    use_case: "",
    expected_impact: "",
    technical_details: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setValidationErrors([])
    
    setIsSubmitting(true)
    
    try {
      const result = await featureRequestService.submitFeatureRequest(formData)
      
      if (result.success) {
        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "feature",
          priority: "medium",
          requester_name: "",
          requester_email: "",
          company: "",
          use_case: "",
          expected_impact: "",
          technical_details: ""
        })
        setIsSubmitting(false)
        onClose()
        
        // Show success message
        alert("Thank you for your feature request! We'll review it and get back to you soon.")
      } else {
        if (result.errors) {
          setValidationErrors(result.errors)
        }
        setError(result.error || "Failed to submit feature request")
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error submitting feature request:", error)
      setError("Unable to submit feature request at this time. Please try again later.")
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear errors when user starts typing
    if (error || validationErrors.length > 0) {
      setError(null)
      setValidationErrors([])
    }
  }

  const getFieldError = (fieldName: string): string | undefined => {
    const fieldError = validationErrors.find(err => err.field === fieldName)
    return fieldError?.message
  }

  const getCategoryIcon = (category: string) => {
    const IconComponent = categoryIcons[category] || MoreHorizontal
    return <IconComponent className="w-4 h-4" />
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close modal"
      />
      
      {/* Modal */}
      <div 
        className="relative bg-zinc-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800 my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feature-request-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Lightbulb className="w-5 h-5 text-purple-400" />
            </div>
            <h2 id="feature-request-modal-title" className="text-2xl font-bold text-white">
              Request a Feature
            </h2>
          </div>
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

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-purple-400" />
              Basic Information
            </h3>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-2">
                Feature Title
                <span className="text-red-400 ml-1" aria-label="Required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                aria-invalid={!!getFieldError('title')}
                aria-describedby={getFieldError('title') ? 'title-error' : undefined}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="Brief summary of your feature request"
                maxLength={200}
              />
              {getFieldError('title') && (
                <p id="title-error" className="mt-2 text-sm text-red-400" role="alert">
                  {getFieldError('title')}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
                Detailed Description
                <span className="text-red-400 ml-1" aria-label="Required">*</span>
              </label>
              <div className="relative">
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  minLength={50}
                  maxLength={2000}
                  aria-invalid={!!getFieldError('description')}
                  aria-describedby={getFieldError('description') ? 'description-error' : 'description-help'}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                  placeholder="Describe your feature request in detail. What problem does it solve? How should it work?"
                />
                <div className="absolute bottom-2 right-2 text-xs text-zinc-500">
                  {formData.description.length}/2000
                </div>
              </div>
              <p id="description-help" className="mt-1 text-xs text-zinc-500">
                Minimum 50 characters, maximum 2000 characters
              </p>
              {getFieldError('description') && (
                <p id="description-error" className="mt-2 text-sm text-red-400" role="alert">
                  {getFieldError('description')}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-zinc-300 mb-2">
                  Category
                  <span className="text-red-400 ml-1" aria-label="Required">*</span>
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    aria-invalid={!!getFieldError('category')}
                    aria-describedby={getFieldError('category') ? 'category-error' : undefined}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 appearance-none"
                  >
                    {FEATURE_REQUEST_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {getCategoryIcon(formData.category)}
                  </div>
                </div>
                {getFieldError('category') && (
                  <p id="category-error" className="mt-2 text-sm text-red-400" role="alert">
                    {getFieldError('category')}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-zinc-300 mb-2">
                  Priority
                  <span className="text-red-400 ml-1" aria-label="Required">*</span>
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                  aria-invalid={!!getFieldError('priority')}
                  aria-describedby={getFieldError('priority') ? 'priority-error' : undefined}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  {FEATURE_REQUEST_PRIORITIES.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
                {getFieldError('priority') && (
                  <p id="priority-error" className="mt-2 text-sm text-red-400" role="alert">
                    {getFieldError('priority')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Your Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Your Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="requester_name" className="block text-sm font-medium text-zinc-300 mb-2">
                  Your Name
                  <span className="text-red-400 ml-1" aria-label="Required">*</span>
                </label>
                <input
                  type="text"
                  id="requester_name"
                  name="requester_name"
                  value={formData.requester_name}
                  onChange={handleChange}
                  required
                  aria-invalid={!!getFieldError('requester_name')}
                  aria-describedby={getFieldError('requester_name') ? 'requester_name-error' : undefined}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="John Doe"
                  maxLength={255}
                />
                {getFieldError('requester_name') && (
                  <p id="requester_name-error" className="mt-2 text-sm text-red-400" role="alert">
                    {getFieldError('requester_name')}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="requester_email" className="block text-sm font-medium text-zinc-300 mb-2">
                  Email Address
                  <span className="text-red-400 ml-1" aria-label="Required">*</span>
                </label>
                <input
                  type="email"
                  id="requester_email"
                  name="requester_email"
                  value={formData.requester_email}
                  onChange={handleChange}
                  required
                  aria-invalid={!!getFieldError('requester_email')}
                  aria-describedby={getFieldError('requester_email') ? 'requester_email-error' : undefined}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="john@company.com"
                  maxLength={255}
                />
                {getFieldError('requester_email') && (
                  <p id="requester_email-error" className="mt-2 text-sm text-red-400" role="alert">
                    {getFieldError('requester_email')}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-zinc-300 mb-2">
                Company (Optional)
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
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Rocket className="w-5 h-5 text-purple-400" />
              Additional Details (Optional)
            </h3>
            
            <div>
              <label htmlFor="use_case" className="block text-sm font-medium text-zinc-300 mb-2">
                Use Case
              </label>
              <textarea
                id="use_case"
                name="use_case"
                value={formData.use_case}
                onChange={handleChange}
                rows={3}
                maxLength={1000}
                aria-invalid={!!getFieldError('use_case')}
                aria-describedby={getFieldError('use_case') ? 'use_case-error' : undefined}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                placeholder="How would you use this feature? What specific problem would it solve for you?"
              />
              {getFieldError('use_case') && (
                <p id="use_case-error" className="mt-2 text-sm text-red-400" role="alert">
                  {getFieldError('use_case')}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="expected_impact" className="block text-sm font-medium text-zinc-300 mb-2">
                Expected Impact
              </label>
              <textarea
                id="expected_impact"
                name="expected_impact"
                value={formData.expected_impact}
                onChange={handleChange}
                rows={3}
                maxLength={1000}
                aria-invalid={!!getFieldError('expected_impact')}
                aria-describedby={getFieldError('expected_impact') ? 'expected_impact-error' : undefined}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                placeholder="What impact would this feature have on your workflow or business?"
              />
              {getFieldError('expected_impact') && (
                <p id="expected_impact-error" className="mt-2 text-sm text-red-400" role="alert">
                  {getFieldError('expected_impact')}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="technical_details" className="block text-sm font-medium text-zinc-300 mb-2">
                Technical Details
              </label>
              <textarea
                id="technical_details"
                name="technical_details"
                value={formData.technical_details}
                onChange={handleChange}
                rows={3}
                maxLength={1000}
                aria-invalid={!!getFieldError('technical_details')}
                aria-describedby={getFieldError('technical_details') ? 'technical_details-error' : undefined}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                placeholder="Any technical requirements, constraints, or implementation suggestions?"
              />
              {getFieldError('technical_details') && (
                <p id="technical_details-error" className="mt-2 text-sm text-red-400" role="alert">
                  {getFieldError('technical_details')}
                </p>
              )}
            </div>
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
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
