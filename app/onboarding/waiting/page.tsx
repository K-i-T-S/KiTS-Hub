'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Clock, 
  Users, 
  Database, 
  Mail, 
  CheckCircle2, 
  Circle, 
  Loader2,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { ProvisioningService } from '@/lib/provisioning'
import { toast } from 'sonner'

const statusSteps = [
  { id: 'account_created', name: 'Account created', icon: CheckCircle2 },
  { id: 'queue_position', name: 'Backend provisioning in queue', icon: Users },
  { id: 'supabase_creation', name: 'Creating Supabase instance', icon: Database },
  { id: 'migration', name: 'Migrating features and data', icon: Database },
  { id: 'ready', name: 'Ready for use', icon: CheckCircle2 },
]

function WaitingPageContent() {
  const searchParams = useSearchParams()
  const customerId = searchParams.get('customer_id')
  
  const [mounted, setMounted] = useState(false)
  const [queuePosition, setQueuePosition] = useState<number | null>(null)
  const [estimatedWaitHours, setEstimatedWaitHours] = useState<number | null>(null)
  const [currentStatus, setCurrentStatus] = useState<string>('pending')
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchQueueStatus = async () => {
    if (!customerId) return

    try {
      const response = await fetch(`/api/queue-position?customer_id=${customerId}`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        setQueuePosition(data.data.position)
        setEstimatedWaitHours(data.data.estimated_wait_hours)
        setCurrentStatus(data.data.status || 'pending')
      } else {
        console.error('Failed to fetch queue status:', data.error)
      }
    } catch (error) {
      console.error('Error getting queue position:', error)
    } finally {
      setIsLoading(false)
      setLastUpdated(new Date())
    }
  }

  useEffect(() => {
    fetchQueueStatus()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchQueueStatus, 30000)
    
    return () => clearInterval(interval)
  }, [customerId])

  const getCurrentStepIndex = () => {
    switch (currentStatus) {
      case 'pending': return 1
      case 'in_progress': return 2
      case 'credentials_received': return 3
      case 'migrating': return 4
      case 'completed': return 5
      default: return 1
    }
  }

  const currentStepIndex = getCurrentStepIndex()
  const progressPercentage = (currentStepIndex / statusSteps.length) * 100

  const formatWaitTime = (hours: number) => {
    if (hours < 1) return 'Less than 1 hour'
    if (hours < 24) return `${Math.round(hours)} hours`
    return `${Math.round(hours / 24)} days`
  }

  const displayWaitTime = () => {
    if (estimatedWaitHours === null) return 'Calculating...'
    return formatWaitTime(estimatedWaitHours)
  }

  const displayQueuePosition = () => {
    if (queuePosition === null) return '—'
    if (queuePosition === 0) return 'Processing'
    return `#${queuePosition}`
  }

  const handleRefresh = () => {
    setIsLoading(true)
    fetchQueueStatus()
  }

  if (!customerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Request</h1>
            <p className="text-muted-foreground mb-4">
              Customer ID is missing. Please start the onboarding process again.
            </p>
            <Button onClick={() => window.location.href = '/onboarding'}>
              Start Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-full mb-4">
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Your KiTS Account is Being Setup</h1>
            <p className="text-xl text-zinc-400">
              We're preparing your personalized business management platform
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center mb-8">
            <Badge variant="outline" className="text-lg px-6 py-2">
              Initialization Phase
            </Badge>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Progress Tracker */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Setup Progress
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Step {currentStepIndex} of {statusSteps.length}</span>
                      <span>{Math.round(progressPercentage)}% Complete</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                  </div>

                  {/* Step List */}
                  <div className="space-y-4">
                    {statusSteps.map((step, index) => {
                      const isActive = index + 1 === currentStepIndex
                      const isCompleted = index + 1 < currentStepIndex
                      const isPending = index + 1 > currentStepIndex
                      const Icon = step.icon

                      return (
                        <div
                          key={step.id}
                          className={`flex items-center space-x-4 p-4 rounded-lg border transition-colors ${
                            isActive ? 'border-primary bg-primary/5' : 
                            isCompleted ? 'border-green-200 bg-green-50' : 
                            'border-gray-200'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="h-6 w-6 text-green-500" />
                            ) : isActive ? (
                              <div className="relative">
                                <Circle className="h-6 w-6 text-primary" />
                                <Loader2 className="absolute inset-0 h-6 w-6 text-primary animate-spin" />
                              </div>
                            ) : (
                              <Circle className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className={`font-medium ${
                                isActive ? 'text-primary' : 
                                isCompleted ? 'text-green-700' : 
                                'text-gray-500'
                              }`}>
                                {step.name}
                              </h3>
                              {isActive && (
                                <Badge variant="secondary" className="text-xs">
                                  In Progress
                                </Badge>
                              )}
                              {isCompleted && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Queue Information */}
            <div className="space-y-6">
              {/* Queue Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Queue Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-1">
                          {displayQueuePosition()}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Your position in queue
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div className="text-center">
                        <div className="text-2xl font-semibold mb-1">
                          {displayWaitTime()}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Estimated wait time
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div className="text-center">
                        <div className="text-lg font-medium mb-1">12-72 hours</div>
                        <p className="text-sm text-muted-foreground">
                          Typical setup time
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* What's Happening */}
              <Card>
                <CardHeader>
                  <CardTitle>What's Happening Now?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p>Your account has been created and verified</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Users className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p>You're in the provisioning queue</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Database className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <p>Our team will create your dedicated Supabase instance</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Database className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <p>Your selected features will be migrated and configured</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Email Notification</h4>
                      <p className="text-sm text-muted-foreground">
                        You'll receive an email at your registered address when your account is ready to use.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Last Updated */}
              <div className="text-center text-xs text-muted-foreground">
                {mounted && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 text-center">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Need help? Contact our support team
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" asChild>
                  <a href="mailto:support@kits.com">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/docs" target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Documentation
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WaitingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <WaitingPageContent />
    </Suspense>
  )
}
