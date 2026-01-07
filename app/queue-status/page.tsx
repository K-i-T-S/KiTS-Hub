'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, ArrowLeft, RefreshCw, Mail, Phone, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface QueueStatusResponse {
  success: boolean
  data?: {
    position: number
    estimated_wait_hours: number
    ahead_in_queue: number
    status: string
    customer?: {
      company_name: string
      email: string
      contact_name: string
    }
  }
  error?: string
}

export default function QueueStatusPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [isLoading, setIsLoading] = useState(false)
  const [queueData, setQueueData] = useState<QueueStatusResponse | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatWaitTime = (hours: number) => {
    if (hours < 1) return 'Less than 1 hour'
    if (hours < 24) return `${Math.round(hours)} hours`
    return `${Math.round(hours / 24)} days`
  }

  const displayWaitTime = () => {
    if (!queueData?.data?.estimated_wait_hours && queueData?.data?.estimated_wait_hours !== 0) return 'Calculating...'
    return formatWaitTime(queueData.data.estimated_wait_hours)
  }

  const displayQueuePosition = () => {
    if (!queueData?.data?.position && queueData?.data?.position !== 0) return '—'
    if (queueData.data.position === 0) return 'Processing'
    return `#${queueData.data.position}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'credentials_received': return 'bg-purple-100 text-purple-800'
      case 'migrating': return 'bg-orange-100 text-orange-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Waiting in queue'
      case 'in_progress': return 'Admin assigned'
      case 'credentials_received': return 'Credentials received'
      case 'migrating': return 'Migration in progress'
      case 'completed': return 'Ready to use!'
      case 'failed': return 'Processing failed'
      default: return 'Unknown status'
    }
  }

  const checkStatus = async () => {
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    // Basic client-side email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/customer-status?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        setQueueData(data)
        toast.success(data.message || 'Status retrieved successfully!')
      } else {
        setQueueData(null)
        
        // Handle different error codes with specific messages
        switch (data.code) {
          case 'MISSING_EMAIL':
            toast.error('Email address is required')
            break
          case 'INVALID_EMAIL_FORMAT':
            toast.error('Please enter a valid email address')
            break
          case 'CUSTOMER_NOT_FOUND':
            toast.error('No account found with this email address. Please check your email or sign up for a new account.')
            break
          case 'SERVICE_UNAVAILABLE':
            toast.error('Service temporarily unavailable. Please try again later.')
            break
          case 'DATABASE_ERROR':
            toast.error('Database error occurred. Please try again later.')
            break
          case 'QUEUE_STATUS_ERROR':
            toast.error('Unable to retrieve queue status. Please try again later.')
            break
          case 'INTERNAL_ERROR':
            toast.error('An unexpected error occurred. Please try again later.')
            break
          default:
            toast.error(data.error || 'Failed to check status. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error checking status:', error)
      toast.error('Network error occurred. Please check your connection and try again.')
      setQueueData(null)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to KiTS Hub
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-2">
              Check Your Provisioning Status
            </h1>
            <p className="text-zinc-400">
              Enter your email address to check the current status of your KiTS Hub provisioning
            </p>
          </div>
        </div>

        {/* Status Check Form */}
        <Card className="max-w-2xl mx-auto mb-8 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Mail className="h-5 w-5 text-purple-400" />
              Status Lookup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 focus:border-purple-500 focus:ring-purple-500/20"
                onKeyPress={(e) => e.key === 'Enter' && checkStatus()}
              />
              <Button 
                onClick={checkStatus}
                disabled={isLoading || !email}
                className="min-w-[120px] bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Status'
                )}
              </Button>
            </div>
            
            <p className="text-sm text-zinc-400">
              Use the same email address you used during sign up
            </p>
          </CardContent>
        </Card>

        {/* Status Results */}
        {queueData?.success && queueData.data && (
          <Card className="max-w-2xl mx-auto bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <RefreshCw className="h-5 w-5 text-purple-400" />
                  Current Status
                </CardTitle>
                <Badge className={getStatusColor(queueData.data.status)}>
                  {getStatusLabel(queueData.data.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Info */}
              {queueData.data.customer && (
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <h3 className="font-semibold text-white mb-2">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-400">Company:</span>
                      <p className="font-medium text-white">{queueData.data.customer.company_name}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Contact:</span>
                      <p className="font-medium text-white">{queueData.data.customer.contact_name}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Email:</span>
                      <p className="font-medium text-white">{queueData.data.customer.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Queue Status */}
              {queueData.data.status === 'pending' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="text-3xl font-bold text-purple-400 mb-1">
                      {displayQueuePosition()}
                    </div>
                    <p className="text-sm text-zinc-300">Your position in queue</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-2xl font-semibold text-green-400 mb-1">
                      {displayWaitTime()}
                    </div>
                    <p className="text-sm text-zinc-300">Estimated wait time</p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-2xl font-semibold text-blue-400 mb-1">
                      {queueData.data.ahead_in_queue}
                    </div>
                    <p className="text-sm text-zinc-300">People ahead of you</p>
                  </div>
                </div>
              )}

              {/* Progress Timeline */}
              <div>
                <h3 className="font-semibold text-white mb-4">Progress Timeline</h3>
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                    ['completed', 'migrating', 'credentials_received', 'in_progress', 'pending'].includes(queueData.data.status) 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-zinc-800/50 border-zinc-700'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      ['completed', 'migrating', 'credentials_received', 'in_progress', 'pending'].includes(queueData.data.status)
                        ? 'bg-green-500' 
                        : 'bg-zinc-600'
                    }`} />
                    <span className="font-medium text-white">Account Created</span>
                    {['completed', 'migrating', 'credentials_received', 'in_progress', 'pending'].includes(queueData.data.status) && (
                      <span className="text-sm text-green-400">✓ Complete</span>
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                    ['completed', 'migrating', 'credentials_received', 'in_progress'].includes(queueData.data.status) 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : queueData.data.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-zinc-800/50 border-zinc-700'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      ['completed', 'migrating', 'credentials_received', 'in_progress'].includes(queueData.data.status)
                        ? 'bg-green-500' 
                        : queueData.data.status === 'pending' ? 'bg-yellow-500 animate-pulse' : 'bg-zinc-600'
                    }`} />
                    <span className="font-medium text-white">Backend Provisioning</span>
                    {queueData.data.status === 'pending' && (
                      <span className="text-sm text-yellow-400">In Queue</span>
                    )}
                    {['completed', 'migrating', 'credentials_received', 'in_progress'].includes(queueData.data.status) && (
                      <span className="text-sm text-green-400">✓ Complete</span>
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                    ['completed', 'migrating'].includes(queueData.data.status) 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : queueData.data.status === 'credentials_received' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-zinc-800/50 border-zinc-700'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      ['completed', 'migrating'].includes(queueData.data.status)
                        ? 'bg-green-500' 
                        : queueData.data.status === 'credentials_received' ? 'bg-blue-500 animate-pulse' : 'bg-zinc-600'
                    }`} />
                    <span className="font-medium text-white">Migration Process</span>
                    {queueData.data.status === 'credentials_received' && (
                      <span className="text-sm text-blue-400">Starting...</span>
                    )}
                    {queueData.data.status === 'migrating' && (
                      <span className="text-sm text-blue-400">In Progress</span>
                    )}
                    {queueData.data.status === 'completed' && (
                      <span className="text-sm text-green-400">✓ Complete</span>
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                    queueData.data.status === 'completed' 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-zinc-800/50 border-zinc-700'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      queueData.data.status === 'completed' ? 'bg-green-500' : 'bg-zinc-600'
                    }`} />
                    <span className="font-medium text-white">Ready to Use</span>
                    {queueData.data.status === 'completed' && (
                      <span className="text-sm text-green-400">✓ Complete</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-zinc-700">
                <Button 
                  onClick={checkStatus}
                  variant="outline"
                  disabled={isLoading}
                  className="border-zinc-600 text-zinc-200 hover:bg-zinc-800 hover:text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
                
                {queueData.data.status === 'completed' && (
                  <Button asChild className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0">
                    <Link href="/login">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Access Your KiTS Hub
                    </Link>
                  </Button>
                )}
                
                {queueData.data.status === 'failed' && (
                  <Button asChild variant="outline" className="border-zinc-600 text-zinc-200 hover:bg-zinc-800 hover:text-white">
                    <Link href="/contact">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Support
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="max-w-2xl mx-auto mt-8 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 text-white">Check your email</h4>
                <p className="text-sm text-zinc-400">
                  We send status updates to your email address throughout the provisioning process.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-white">Contact support</h4>
                <p className="text-sm text-zinc-400">
                  If you have any questions, reach out to our support team for assistance.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-zinc-700">
              <Button variant="outline" asChild className="border-zinc-600 text-zinc-200 hover:bg-zinc-800 hover:text-white">
                <Link href="/contact">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
              <Button variant="outline" asChild className="border-zinc-600 text-zinc-200 hover:bg-zinc-800 hover:text-white">
                <Link href="/docs/provisioning">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Provisioning Docs
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
