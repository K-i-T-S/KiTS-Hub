'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  FeatureRequest, 
  FeatureRequestStats, 
  FEATURE_REQUEST_CATEGORIES, 
  FEATURE_REQUEST_PRIORITIES, 
  FEATURE_REQUEST_STATUSES 
} from '@/types/feature-request'
import { featureRequestService } from '@/services/feature-request-service'
import { 
  Lightbulb, 
  Search, 
  Filter, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Eye,
  ThumbsUp,
  MessageSquare,
  Calendar,
  BarChart3,
  Download,
  Settings
} from 'lucide-react'

type FilterOptions = {
  searchTerm: string
  statusFilter: string
  categoryFilter: string
  priorityFilter: string
  sortBy: string
  sortOrder: string
}

export default function FeatureRequestsAdmin() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([])
  const [stats, setStats] = useState<FeatureRequestStats | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<FeatureRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    statusFilter: 'all',
    categoryFilter: 'all',
    priorityFilter: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  useEffect(() => {
    if (profile?.is_admin) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [profile])

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const [requestsRes, statsRes] = await Promise.all([
        featureRequestService.getAllFeatureRequests(),
        featureRequestService.getFeatureRequestStats()
      ])
      
      setFeatureRequests(requestsRes)
      setStats(statsRes)
    } catch (err) {
      console.error('Error fetching feature requests:', err)
      setError('Failed to load feature requests')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }, [fetchData])

  const handleStatusUpdate = useCallback(async (requestId: string, newStatus: FeatureRequest['status']) => {
    setStatusUpdateLoading(true)
    try {
      const result = await featureRequestService.updateFeatureRequestStatus(requestId, newStatus, adminNotes)
      if (result.success) {
        await fetchData()
        setSelectedRequest(null)
        setAdminNotes('')
      } else {
        setError(result.error || 'Failed to update status')
      }
    } catch (err) {
      console.error('Error updating status:', err)
      setError('Failed to update status')
    } finally {
      setStatusUpdateLoading(false)
    }
  }, [adminNotes, fetchData])

  const handleDeleteRequest = useCallback(async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this feature request? This action cannot be undone.')) {
      return
    }

    try {
      const result = await featureRequestService.deleteFeatureRequest(requestId)
      if (result.success) {
        await fetchData()
      } else {
        setError(result.error || 'Failed to delete request')
      }
    } catch (err) {
      console.error('Error deleting request:', err)
      setError('Failed to delete request')
    }
  }, [fetchData])

  const filteredRequests = useMemo(() => {
    let filtered = [...featureRequests]

    // Apply filters
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(request => 
        request.title.toLowerCase().includes(searchLower) ||
        request.description.toLowerCase().includes(searchLower) ||
        request.requester_name.toLowerCase().includes(searchLower) ||
        request.requester_email.toLowerCase().includes(searchLower)
      )
    }

    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === filters.statusFilter)
    }

    if (filters.categoryFilter !== 'all') {
      filtered = filtered.filter(request => request.category === filters.categoryFilter)
    }

    if (filters.priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === filters.priorityFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof FeatureRequest]
      let bValue: any = b[filters.sortBy as keyof FeatureRequest]

      if (filters.sortBy === 'created_at' || filters.sortBy === 'updated_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [featureRequests, filters])

  const getStatusColor = (status: string) => {
    const statusConfig = FEATURE_REQUEST_STATUSES.find(s => s.value === status)
    return statusConfig?.color || 'text-gray-400'
  }

  const getPriorityColor = (priority: string) => {
    const priorityConfig = FEATURE_REQUEST_PRIORITIES.find(p => p.value === priority)
    return priorityConfig?.color || 'text-gray-400'
  }

  const getCategoryLabel = (category: string) => {
    const categoryConfig = FEATURE_REQUEST_CATEGORIES.find(c => c.value === category)
    return categoryConfig?.label || category
  }

  if (!profile?.is_admin) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2">Loading feature requests...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb className="h-8 w-8 text-purple-500" />
            Feature Requests
          </h1>
          <p className="text-gray-600 mt-2">Manage and track user feature requests</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All feature requests</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
              <p className="text-xs text-muted-foreground">Currently being worked on</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Successfully implemented</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search requests..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filters.statusFilter} onValueChange={(value) => setFilters(prev => ({ ...prev, statusFilter: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {FEATURE_REQUEST_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={filters.categoryFilter} onValueChange={(value) => setFilters(prev => ({ ...prev, categoryFilter: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {FEATURE_REQUEST_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={filters.priorityFilter} onValueChange={(value) => setFilters(prev => ({ ...prev, priorityFilter: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {FEATURE_REQUEST_PRIORITIES.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={`${filters.sortBy}-${filters.sortOrder}`} onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-')
                setFilters(prev => ({ ...prev, sortBy, sortOrder }))
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="upvotes-desc">Most Upvotes</SelectItem>
                  <SelectItem value="views-desc">Most Views</SelectItem>
                  <SelectItem value="priority-desc">Highest Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Requests ({filteredRequests.length})</CardTitle>
          <CardDescription>Manage user-submitted feature requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Upvotes</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <Lightbulb className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-500">No feature requests found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {request.description.substring(0, 100)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCategoryLabel(request.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.requester_name}</div>
                          <div className="text-sm text-gray-500">{request.requester_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {request.upvotes}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request)
                                  setAdminNotes(request.admin_notes || '')
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Lightbulb className="h-5 w-5" />
                                  {request.title}
                                </DialogTitle>
                                <DialogDescription>
                                  Feature request details and management
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedRequest && (
                                <div className="space-y-6">
                                  {/* Request Details */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Category</label>
                                      <p>{getCategoryLabel(selectedRequest.category)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Priority</label>
                                      <Badge className={getPriorityColor(selectedRequest.priority)}>
                                        {selectedRequest.priority}
                                      </Badge>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Status</label>
                                      <Badge className={getStatusColor(selectedRequest.status)}>
                                        {selectedRequest.status.replace('_', ' ')}
                                      </Badge>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Created</label>
                                      <p>{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                                    </div>
                                  </div>

                                  {/* Requester Info */}
                                  <div>
                                    <label className="text-sm font-medium">Requester</label>
                                    <div className="mt-1">
                                      <p>{selectedRequest.requester_name}</p>
                                      <p className="text-sm text-gray-500">{selectedRequest.requester_email}</p>
                                      {selectedRequest.company && (
                                        <p className="text-sm text-gray-500">{selectedRequest.company}</p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Description */}
                                  <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <p className="mt-1 text-sm">{selectedRequest.description}</p>
                                  </div>

                                  {/* Additional Details */}
                                  {(selectedRequest.use_case || selectedRequest.expected_impact || selectedRequest.technical_details) && (
                                    <div>
                                      <label className="text-sm font-medium">Additional Details</label>
                                      <div className="mt-2 space-y-2">
                                        {selectedRequest.use_case && (
                                          <div>
                                            <p className="text-xs font-medium text-gray-500">Use Case:</p>
                                            <p className="text-sm">{selectedRequest.use_case}</p>
                                          </div>
                                        )}
                                        {selectedRequest.expected_impact && (
                                          <div>
                                            <p className="text-xs font-medium text-gray-500">Expected Impact:</p>
                                            <p className="text-sm">{selectedRequest.expected_impact}</p>
                                          </div>
                                        )}
                                        {selectedRequest.technical_details && (
                                          <div>
                                            <p className="text-xs font-medium text-gray-500">Technical Details:</p>
                                            <p className="text-sm">{selectedRequest.technical_details}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Stats */}
                                  <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                      <ThumbsUp className="h-4 w-4" />
                                      {selectedRequest.upvotes} upvotes
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Eye className="h-4 w-4" />
                                      {selectedRequest.views} views
                                    </div>
                                  </div>

                                  {/* Admin Actions */}
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium">Admin Notes</label>
                                      <Textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Add internal notes about this feature request..."
                                        className="mt-1"
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="text-sm font-medium">Update Status</label>
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {FEATURE_REQUEST_STATUSES.map(status => (
                                          <Button
                                            key={status.value}
                                            variant={selectedRequest.status === status.value ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleStatusUpdate(selectedRequest.id, status.value as FeatureRequest['status'])}
                                            disabled={statusUpdateLoading}
                                          >
                                            {status.label}
                                          </Button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
