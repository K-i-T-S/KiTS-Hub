export interface FeatureRequest {
  id: string
  title: string
  description: string
  category: 'feature' | 'bug_fix' | 'enhancement' | 'integration' | 'ui_ux' | 'performance' | 'security' | 'other'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'rejected' | 'duplicate'
  requester_name: string
  requester_email: string
  company?: string | null
  use_case?: string | null
  expected_impact?: string | null
  technical_details?: string | null
  attachments: any[]
  upvotes: number
  views: number
  admin_notes?: string | null
  assigned_to?: string | null
  estimated_timeline?: string | null
  actual_completion_date?: string | null
  duplicate_of?: string | null
  created_at: string
  updated_at: string
}

export interface FeatureRequestFormData {
  title: string
  description: string
  category: 'feature' | 'bug_fix' | 'enhancement' | 'integration' | 'ui_ux' | 'performance' | 'security' | 'other'
  priority: 'low' | 'medium' | 'high' | 'critical'
  requester_name: string
  requester_email: string
  company?: string
  use_case?: string
  expected_impact?: string
  technical_details?: string
}

export interface FeatureRequestUpvote {
  id: string
  feature_request_id: string
  user_email: string
  user_name?: string | null
  created_at: string
}

export interface FeatureRequestComment {
  id: string
  feature_request_id: string
  author_name: string
  author_email: string
  comment: string
  is_internal: boolean
  created_at: string
  updated_at: string
}

export interface FeatureRequestStats {
  total: number
  pending: number
  under_review: number
  planned: number
  in_progress: number
  completed: number
  rejected: number
  duplicate: number
  by_category: Record<string, number>
  by_priority: Record<string, number>
  average_completion_days?: number
  total_upvotes: number
}

export interface FeatureRequestFilters {
  status?: string[]
  category?: string[]
  priority?: string[]
  search?: string
  sort_by?: 'created_at' | 'upvotes' | 'views' | 'priority' | 'status'
  sort_order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface FeatureRequestServiceResponse {
  success: boolean
  error?: string
  errors?: ValidationError[]
  data?: FeatureRequest | FeatureRequest[] | FeatureRequestStats
}

export interface ValidationError {
  field: string
  message: string
}

export const FEATURE_REQUEST_CATEGORIES = [
  { value: 'feature', label: 'New Feature' },
  { value: 'bug_fix', label: 'Bug Fix' },
  { value: 'enhancement', label: 'Enhancement' },
  { value: 'integration', label: 'Integration' },
  { value: 'ui_ux', label: 'UI/UX' },
  { value: 'performance', label: 'Performance' },
  { value: 'security', label: 'Security' },
  { value: 'other', label: 'Other' }
] as const

export const FEATURE_REQUEST_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-gray-400' },
  { value: 'medium', label: 'Medium', color: 'text-blue-400' },
  { value: 'high', label: 'High', color: 'text-orange-400' },
  { value: 'critical', label: 'Critical', color: 'text-red-400' }
] as const

export const FEATURE_REQUEST_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'text-gray-400' },
  { value: 'under_review', label: 'Under Review', color: 'text-blue-400' },
  { value: 'planned', label: 'Planned', color: 'text-purple-400' },
  { value: 'in_progress', label: 'In Progress', color: 'text-yellow-400' },
  { value: 'completed', label: 'Completed', color: 'text-green-400' },
  { value: 'rejected', label: 'Rejected', color: 'text-red-400' },
  { value: 'duplicate', label: 'Duplicate', color: 'text-gray-500' }
] as const
