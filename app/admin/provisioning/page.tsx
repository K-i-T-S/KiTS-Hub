'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CredentialSubmissionModal } from '@/components/admin/credential-submission-modal'
import { 
  Database, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Settings,
  LogOut,
  RefreshCw,
  Clock,
  Users,
  Calendar,
  Play
} from 'lucide-react'
import { ProvisioningQueue, QueueStats } from '@/types/provisioning'
import { ProvisioningService } from '@/lib/provisioning'

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800',
    icon: Play,
  },
  credentials_received: {
    label: 'Credentials Received',
    color: 'bg-purple-100 text-purple-800',
    icon: Database,
  },
  migrating: {
    label: 'Migrating',
    color: 'bg-orange-100 text-orange-800',
    icon: Settings,
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800',
    icon: AlertCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800',
    icon: AlertCircle,
  },
}

const priorityConfig: Record<number, { label: string; color: string }> = {
  0: { label: 'Normal', color: 'bg-zinc-100 text-zinc-800' },
  1: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  2: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
};

export default function ProvisioningDashboard() {
  const [queue, setQueue] = useState<ProvisioningQueue[]>([])
  const [stats, setStats] = useState<QueueStats | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<ProvisioningQueue | null>(null)
  const [showCredentialModal, setShowCredentialModal] = useState(false)
  const [currentAdminId] = useState('3a89e43e-b069-4d02-9779-1cda58ec3104') // This would come from auth

  const fetchData = async () => {
    try {
      const [queueResponse, statsResponse] = await Promise.all([
        fetch(`/api/provisioning-queue?status=${selectedStatus}`),
        fetch('/api/queue-stats')
      ])

      const queueData = await queueResponse.json()
      const statsData = await statsResponse.json()

      if (queueResponse.ok && queueData.success) {
        setQueue(queueData.data || [])
      }

      if (statsResponse.ok && statsData.success) {
        setStats(statsData.data || null)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch provisioning data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Set up real-time subscription
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [selectedStatus])

  const handleClaimTask = async (queueId: string) => {
    console.log('🔧 Debug: Claim task clicked for queueId:', queueId)
    console.log('🔧 Debug: Admin ID:', currentAdminId)
    
    try {
      console.log('🔧 Debug: Making API call to /api/claim-task...')
      const response = await fetch('/api/claim-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queue_id: queueId,
          admin_id: currentAdminId
        })
      })

      console.log('🔧 Debug: API response status:', response.status)
      const data = await response.json()
      console.log('🔧 Debug: API response data:', data)

      if (response.ok && data.success) {
        toast.success('Task claimed successfully')
        fetchData()
      } else {
        toast.error(data.error || 'Failed to claim task')
      }
    } catch (error) {
      console.error('🔧 Debug: Error claiming task:', error)
      toast.error('Failed to claim task')
    }
  }

  const handleViewDetails = (customer: ProvisioningQueue) => {
    setSelectedCustomer(customer)
  }

  const handleSubmitCredentials = (customer: ProvisioningQueue) => {
    setSelectedCustomer(customer)
    setShowCredentialModal(true)
  }

  const formatWaitTime = (hours: number) => {
    if (hours < 1) return '< 1h'
    if (hours < 24) return `${Math.round(hours)}h`
    return `${Math.round(hours / 24)}d`
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffMs = now.getTime() - past.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const getOverdueItems = () => {
    return queue.filter(item => 
      item.status === 'pending' || item.status === 'in_progress'
    ).filter(item => {
      const estimatedTime = new Date(item.estimated_completion)
      return estimatedTime < new Date()
    })
  }

  if (isLoading && queue.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-zinc-400" />
          <p className="text-zinc-300">Loading provisioning dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Provisioning Dashboard</h1>
            <p className="text-zinc-400">
              Manage customer onboarding and backend provisioning
            </p>
          </div>
          <Button onClick={fetchData} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2 text-zinc-400" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2 text-zinc-400" />
            )}
            Refresh
          </Button>
        </div>

        {/* Admin Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Back to Site
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/admin')}>
              <Settings className="h-4 w-4 mr-2" />
              Admin Home
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('/', '_blank')}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">{stats.in_progress}</p>
                  </div>
                  <Play className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                    <p className="text-2xl font-bold">{stats.completed_today}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{stats.overdue_count}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Overdue Alert */}
        {getOverdueItems().length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <h3 className="font-semibold text-red-800">
                    {getOverdueItems().length} Overdue Item{getOverdueItems().length > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-red-600">
                    Some provisioning tasks are past their estimated completion time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Queue Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Provisioning Queue
              </CardTitle>
              
              {/* Status Filter */}
              <div className="flex gap-2">
                {['all', 'pending', 'in_progress', 'completed', 'failed'].map((status) => (
                  <Button
                    key={status}
                    variant={selectedStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {queue.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items in queue</h3>
                <p className="text-gray-500">
                  {selectedStatus === 'all' 
                    ? 'No provisioning requests at this time'
                    : `No ${selectedStatus} items in queue`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {queue.map((item) => {
                  const StatusIcon = statusConfig[item.status].icon
                  const isOverdue = new Date(item.estimated_completion) < new Date() && 
                                   ['pending', 'in_progress'].includes(item.status)
                  
                  return (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <StatusIcon className="h-5 w-5" />
                            <h3 className="font-semibold">{item.customer?.company_name}</h3>
                            <Badge className={statusConfig[item.status].color}>
                              {statusConfig[item.status].label}
                            </Badge>
                            <Badge className={priorityConfig[item.priority].color}>
                              {priorityConfig[item.priority].label}
                            </Badge>
                            {isOverdue && (
                              <Badge variant="destructive">Overdue</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{item.customer?.contact_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Created {formatTimeAgo(item.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                Est. {formatWaitTime(
                                  (new Date(item.estimated_completion).getTime() - new Date(item.created_at).getTime()) / (1000 * 60 * 60)
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {item.requested_features.map((feature) => (
                                <Badge key={feature} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {item.admin_notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                              <strong>Notes:</strong> {item.admin_notes}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(item)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          
                          {item.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleClaimTask(item.id)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Claim
                            </Button>
                          )}
                          
                          {item.status === 'in_progress' && item.admin_assigned_to === currentAdminId && (
                            <Button
                              size="sm"
                              onClick={() => handleSubmitCredentials(item)}
                            >
                              <Database className="h-4 w-4 mr-1" />
                              Submit Credentials
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Details Modal */}
        {selectedCustomer && !showCredentialModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Company</h4>
                    <p>{selectedCustomer.customer?.company_name}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Contact</h4>
                    <p>{selectedCustomer.customer?.contact_name}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <p>{selectedCustomer.customer?.email}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Phone</h4>
                    <p>{selectedCustomer.customer?.phone || 'Not provided'}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Requested Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomer.requested_features.map((feature) => (
                      <Badge key={feature} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Status</h4>
                    <Badge className={statusConfig[selectedCustomer.status].color}>
                      {statusConfig[selectedCustomer.status].label}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold">Priority</h4>
                    <Badge className={priorityConfig[selectedCustomer.priority].color}>
                      {priorityConfig[selectedCustomer.priority].label}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold">Created</h4>
                    <p>{new Date(selectedCustomer.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Est. Completion</h4>
                    <p>{new Date(selectedCustomer.estimated_completion).toLocaleString()}</p>
                  </div>
                </div>

                {selectedCustomer.admin_notes && (
                  <div>
                    <h4 className="font-semibold">Admin Notes</h4>
                    <p className="text-sm text-gray-600">{selectedCustomer.admin_notes}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                    Close
                  </Button>
                  {selectedCustomer.status === 'in_progress' && selectedCustomer.admin_assigned_to === currentAdminId && (
                    <Button onClick={() => setShowCredentialModal(true)}>
                      Submit Credentials
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Credential Submission Modal */}
        {showCredentialModal && selectedCustomer && (
          <CredentialSubmissionModal
            customer={selectedCustomer}
            onClose={() => {
              setShowCredentialModal(false)
              setSelectedCustomer(null)
            }}
            onSuccess={() => {
              setShowCredentialModal(false)
              setSelectedCustomer(null)
              fetchData()
            }}
          />
        )}
      </div>
    </div>
  )
}
