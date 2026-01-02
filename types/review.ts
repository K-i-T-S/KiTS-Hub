export interface Review {
  id: string
  name: string
  email: string
  company?: string
  title?: string
  review: string
  rating: number
  status: 'pending' | 'approved' | 'rejected'
  spam_score: number
  flagged: boolean
  flag_reason?: string
  created_at: string
  updated_at: string
}

export interface ReviewFormData {
  name: string
  email: string
  company: string
  title: string
  review: string
  rating: number
}
