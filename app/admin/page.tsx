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
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  Users, 
  Phone, 
  CreditCard, 
  Eye, 
  TrendingUp,
  Activity,
  Search,
  Filter,
  RefreshCw,
  Download,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Lightbulb,
  Server
} from 'lucide-react'

// Define types inline since Database type is not available
interface Lead {
  id: string
  company_name: string
  email: string
  phone?: string
  status: 'new' | 'contacted' | 'qualified' | 'converted'
  created_at: string
  full_name?: string
  company?: string
}

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  message: string
  created_at: string
  full_name?: string
  company?: string
}

interface Subscription {
  id: string
  email: string
  status: 'active' | 'cancelled' | 'trial'
  plan: string
  created_at: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  current_period_start?: string
  current_period_end?: string
}

interface Visitor {
  id: string
  page_url: string
  user_agent?: string
  ip_address?: string
  created_at: string
  session_id?: string
  browser?: string
  os?: string
  device_type?: string
  country?: string
  last_seen_at?: string
  total_visits?: number
}

type AdminStats = {
  totalLeads: number
  newLeads: number
  totalContacts: number
  activeSubscriptions: number
  totalVisitors: number
  uniqueVisitors: number
  conversionRate: number
  avgSessionDuration: string
  pageViewsPerSession: number
  bounceRate: number
}

type FilterOptions = {
  searchTerm: string
  statusFilter: string
  dateRange: string
}

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    statusFilter: 'all',
    dateRange: 'all'
  })

  useEffect(() => {
    if (profile?.is_admin) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [profile])

  const fetchData = useCallback(async () => {
    if (!supabase) {
      setError('Database not configured')
      setLoading(false)
      return
    }

    try {
      setError(null)
      const [leadsRes, contactsRes, subscriptionsRes, visitorsRes] = await Promise.all([
        supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000),
        supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000),
        supabase
          .from('subscriptions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000),
        supabase
          .from('visitors')
          .select('*')
          .order('last_seen_at', { ascending: false })
          .limit(100),
      ])

      if (leadsRes.error) throw leadsRes.error
      if (contactsRes.error) throw contactsRes.error
      if (subscriptionsRes.error) throw subscriptionsRes.error
      if (visitorsRes.error) throw visitorsRes.error

      setLeads(leadsRes.data || [])
      setContacts(contactsRes.data || [])
      setSubscriptions(subscriptionsRes.data || [])
      setVisitors(visitorsRes.data || [])
    } catch (error) {
      console.error('Error fetching admin data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        lead.full_name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      const matchesStatus = filters.statusFilter === 'all' || lead.status === filters.statusFilter
      return matchesSearch && matchesStatus
    })
  }, [leads, filters.searchTerm, filters.statusFilter])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    fetchData()
  }, [fetchData])

  const handleFilterChange = useCallback((key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const stats = useMemo((): AdminStats => {
    const uniqueVisitors = new Set(visitors.map(v => v.session_id)).size
    const totalLeads = leads.length
    const convertedLeads = leads.filter(l => l.status === 'converted').length
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0
    
    return {
      totalLeads,
      newLeads: leads.filter(l => l.status === 'new').length,
      totalContacts: contacts.length,
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      totalVisitors: visitors.length,
      uniqueVisitors,
      conversionRate: Number(conversionRate.toFixed(1)),
      avgSessionDuration: '3m 24s',
      pageViewsPerSession: 4.2,
      bounceRate: 32.1
    }
  }, [leads, contacts, subscriptions, visitors])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-green-100 text-green-800'
      case 'converted': return 'bg-purple-100 text-purple-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'canceled': return 'bg-red-100 text-red-800'
      case 'trialing': return 'bg-blue-100 text-blue-800'
      case 'past_due': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600">Access Denied</CardTitle>
            <CardDescription>
              Don&apos;t have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-8"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Premium Header with Glassmorphism */}
        <div className="mb-10">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse"></div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                </div>
                <p className="text-emerald-100/80 text-lg font-light">
                  Manage your KiTS Hub business intelligence and analytics
                </p>
                <div className="flex items-center gap-4 text-sm text-emerald-200/60">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    Real-time data
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    Advanced analytics
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    AI-powered insights
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white hover:text-emerald-200 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2"
                  aria-label="Refresh data"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Syncing...' : 'Sync Data'}
                </Button>
                <Button 
                  onClick={() => window.location.href = '/admin/provisioning'}
                  className="backdrop-blur-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 border-0 text-white shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 flex items-center gap-2 px-6 py-3"
                >
                  <Server className="h-4 w-4" />
                  Provisioning
                </Button>
                <Button 
                  onClick={() => window.location.href = '/admin/reviews'}
                  className="backdrop-blur-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center gap-2 px-6 py-3"
                >
                  <Users className="h-4 w-4" />
                  Reviews
                </Button>
                <Button 
                  onClick={() => window.location.href = '/admin/feature-requests'}
                  className="backdrop-blur-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0 text-white shadow-lg hover:shadow-orange-500/30 transition-all duration-300 flex items-center gap-2 px-6 py-3"
                >
                  <Lightbulb className="h-4 w-4" />
                  Features
                </Button>
                <Button 
                  onClick={() => {
                    // Add logout functionality
                    supabase?.auth.signOut()
                    window.location.href = '/login'
                  }}
                  className="backdrop-blur-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 border-0 text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Error Display */}
        {error && (
          <div className="mb-6 backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-center gap-4 shadow-2xl shadow-red-500/20">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-red-100 font-semibold text-lg">Data Sync Error</p>
              <p className="text-red-200/80">{error}</p>
            </div>
            <Button 
              onClick={handleRefresh}
              className="backdrop-blur-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-100 hover:text-white transition-all duration-300"
            >
              Retry Connection
            </Button>
          </div>
        )}
        {/* Ultra-Premium Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="group relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-emerald-100 font-semibold">Total Leads</CardTitle>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-2">{stats.totalLeads}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <p className="text-emerald-200/80 text-sm">
                    {stats.newLeads} new this period
                  </p>
                </div>
                <div className="mt-3 h-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full overflow-hidden">
                  <div className="h-full bg-white/30 rounded-full" style={{width: '67%'}}></div>
                </div>
              </CardContent>
            </div>
          </Card>

          <Card className="group relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-blue-100 font-semibold">Contacts</CardTitle>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Phone className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-2">{stats.totalContacts}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <p className="text-blue-200/80 text-sm">
                    Active connections
                  </p>
                </div>
                <div className="mt-3 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full overflow-hidden">
                  <div className="h-full bg-white/30 rounded-full" style={{width: '82%'}}></div>
                </div>
              </CardContent>
            </div>
          </Card>

          <Card className="group relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-purple-100 font-semibold">Subscriptions</CardTitle>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-2">{stats.activeSubscriptions}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <p className="text-purple-200/80 text-sm">
                    Recurring revenue
                  </p>
                </div>
                <div className="mt-3 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full overflow-hidden">
                  <div className="h-full bg-white/30 rounded-full" style={{width: '91%'}}></div>
                </div>
              </CardContent>
            </div>
          </Card>

          <Card className="group relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 hover:border-orange-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-orange-100 font-semibold">Visitors</CardTitle>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-2">{stats.uniqueVisitors}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <p className="text-orange-200/80 text-sm">
                    {stats.totalVisitors} sessions
                  </p>
                </div>
                <div className="mt-3 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full overflow-hidden">
                  <div className="h-full bg-white/30 rounded-full" style={{width: '73%'}}></div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Conversion Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Conversion Rate</p>
                  <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Avg. Session</p>
                  <p className="text-2xl font-bold">{stats.avgSessionDuration}</p>
                </div>
                <Clock className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Page Views</p>
                  <p className="text-2xl font-bold">{stats.pageViewsPerSession}</p>
                </div>
                <Eye className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Bounce Rate</p>
                  <p className="text-2xl font-bold">{stats.bounceRate}%</p>
                </div>
                <Activity className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Tabs with Glassmorphism */}
        <Tabs defaultValue="leads" className="space-y-8">
          <TabsList className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-2 shadow-2xl grid w-full grid-cols-5">
            <TabsTrigger 
              value="leads" 
              className="backdrop-blur-xl data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/30 text-emerald-200/80 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Leads
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="contacts" 
              className="backdrop-blur-xl data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 text-blue-200/80 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contacts
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="subscriptions" 
              className="backdrop-blur-xl data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 text-purple-200/80 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Subscriptions
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="backdrop-blur-xl data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/30 text-orange-200/80 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="feature-requests" 
              className="backdrop-blur-xl data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 text-purple-200/80 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Feature Requests
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
              <CardHeader className="backdrop-blur-xl bg-white/5 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      Lead Management
                    </CardTitle>
                    <CardDescription className="text-emerald-200/70">
                      Track and manage your sales pipeline with advanced analytics
                    </CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-300/60" />
                      <Input
                        placeholder="Search leads by name, email, or company..."
                        className="pl-12 w-80 backdrop-blur-xl bg-white/10 border-white/20 text-white placeholder-emerald-300/60 focus:border-emerald-400/50 focus:ring-emerald-400/20 rounded-xl"
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        aria-label="Search leads"
                      />
                    </div>
                    <Select value={filters.statusFilter} onValueChange={(value) => handleFilterChange('statusFilter', value)}>
                      <SelectTrigger className="backdrop-blur-xl bg-white/10 border-white/20 text-white hover:bg-white/20 w-40 rounded-xl">
                        <Filter className="h-4 w-4 mr-2 text-emerald-300/60" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="backdrop-blur-xl bg-gray-900/95 border-gray-700 text-white">
                        <SelectItem value="all" className="text-white hover:bg-white/10">All Status</SelectItem>
                        <SelectItem value="new" className="text-white hover:bg-white/10">New</SelectItem>
                        <SelectItem value="contacted" className="text-white hover:bg-white/10">Contacted</SelectItem>
                        <SelectItem value="qualified" className="text-white hover:bg-white/10">Qualified</SelectItem>
                        <SelectItem value="converted" className="text-white hover:bg-white/10">Converted</SelectItem>
                        <SelectItem value="closed" className="text-white hover:bg-white/10">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Enhanced Table with Premium Design & High Contrast */}
                <div className="backdrop-blur-xl bg-black/30 border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
                  <Table>
                    <TableHeader className="backdrop-blur-xl bg-white/15 border-b border-white/30">
                      <TableRow>
                        <TableHead className="font-bold text-white uppercase tracking-wider text-sm border-r border-white/20">Lead</TableHead>
                        <TableHead className="font-bold text-white uppercase tracking-wider text-sm border-r border-white/20">Contact</TableHead>
                        <TableHead className="font-bold text-white uppercase tracking-wider text-sm border-r border-white/20">Company</TableHead>
                        <TableHead className="font-bold text-white uppercase tracking-wider text-sm border-r border-white/20">Status</TableHead>
                        <TableHead className="font-bold text-white uppercase tracking-wider text-sm border-r border-white/20">Created</TableHead>
                        <TableHead className="font-bold text-white uppercase tracking-wider text-sm text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-16">
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400/30 to-cyan-400/30 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <Search className="h-8 w-8 text-emerald-300" />
                              </div>
                              <div className="space-y-2">
                                <p className="text-white text-lg font-semibold">No leads found</p>
                                <p className="text-emerald-200/60 text-sm">Try adjusting your search or filter criteria</p>
                              </div>
                              <Button 
                                onClick={() => handleFilterChange('searchTerm', '')}
                                className="backdrop-blur-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 border-0 text-white shadow-lg hover:shadow-emerald-500/40 transition-all duration-300 rounded-xl px-6"
                              >
                                Clear Search
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLeads.map((lead, index) => (
                          <TableRow 
                            key={lead.id} 
                            className="border-b border-white/10 hover:bg-white/10 transition-all duration-300 group"
                          >
                            <TableCell className="py-4 border-r border-white/10">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400/30 to-cyan-400/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/30">
                                  <Users className="h-5 w-5 text-emerald-300" />
                                </div>
                                <div>
                                  <p className="font-semibold text-white">{lead.full_name || 'Unknown'}</p>
                                  <p className="text-emerald-200/70 text-xs font-mono">ID: {lead.id.slice(0, 8)}...</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-emerald-100 border-r border-white/10">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-500/50"></div>
                                <span className="font-medium">{lead.email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-emerald-100 border-r border-white/10">
                              <span className="font-medium">{lead.company || 'Not specified'}</span>
                            </TableCell>
                            <TableCell className="border-r border-white/10">
                              <Badge className={`${getStatusColor(lead.status)} border-0 backdrop-blur-xl px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                                {lead.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-emerald-200/80 border-r border-white/10">
                              <span className="font-medium">
                                {new Date(lead.created_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="backdrop-blur-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border-emerald-400/50 hover:border-emerald-400 text-emerald-100 hover:text-white transition-all duration-300 rounded-xl group-hover:scale-105 shadow-lg hover:shadow-emerald-500/40 font-semibold"
                                aria-label={`View details for ${lead.full_name || lead.email}`}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
              <CardHeader className="backdrop-blur-xl bg-white/5 border-b border-white/10">
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center">
                      <Phone className="h-4 w-4 text-white" />
                    </div>
                    Contact Management
                  </CardTitle>
                  <CardDescription className="text-blue-200/70">
                    Manage your customer relationships and communication history
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Premium Contacts Table */}
                <div className="backdrop-blur-xl bg-black/30 border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
                  <Table>
                    <TableHeader className="backdrop-blur-xl bg-white/15 border-b border-white/30">
                      <TableRow>
                        <TableHead className="font-bold text-white uppercase tracking-wider text-sm border-r border-white/20">Contact</TableHead>
                        <TableHead className="font-bold text-white uppercase tracking-wider text-sm border-r border-white/20">Email</TableHead>
                        <TableHead className="font-bold text-white uppercase tracking-wider text-sm border-r border-white/20">Company</TableHead>
                        <TableHead className="font-bold text-white uppercase tracking-wider text-sm border-r border-white/20">Phone</TableHead>
                        <TableHead className="font-bold text-white uppercase tracking-wider text-sm">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-16">
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <Phone className="h-8 w-8 text-blue-300" />
                              </div>
                              <div className="space-y-2">
                                <p className="text-white text-lg font-semibold">No contacts found</p>
                                <p className="text-blue-200/60 text-sm">Start building your contact database</p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        contacts.map((contact) => (
                          <TableRow 
                            key={contact.id} 
                            className="border-b border-white/10 hover:bg-white/10 transition-all duration-300 group"
                          >
                            <TableCell className="py-4 border-r border-white/10">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                                  <Phone className="h-5 w-5 text-blue-300" />
                                </div>
                                <div>
                                  <p className="font-semibold text-white">{contact.full_name || 'Unknown'}</p>
                                  <p className="text-blue-200/70 text-xs font-mono">ID: {contact.id.slice(0, 8)}...</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-blue-100 border-r border-white/10">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full shadow-lg shadow-blue-500/50"></div>
                                <span className="font-medium">{contact.email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-blue-100 border-r border-white/10">
                              <span className="font-medium">{contact.company || 'Not specified'}</span>
                            </TableCell>
                            <TableCell className="text-blue-100 border-r border-white/10">
                              <span className="font-medium">{contact.phone || 'Not provided'}</span>
                            </TableCell>
                            <TableCell className="text-blue-200/80">
                              <span className="font-medium">
                                {new Date(contact.created_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
              <CardHeader className="backdrop-blur-xl bg-white/5 border-b border-white/10">
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    Subscription Management
                  </CardTitle>
                  <CardDescription className="text-purple-200/70">
                    Monitor and manage customer subscriptions and recurring revenue
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Premium Subscriptions Table */}
                <div className="backdrop-blur-xl bg-black/30 border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
                  <Table>
                    <TableHeader className="backdrop-blur-xl bg-white/15 border-b border-white/30">
                      <TableRow>
                        <TableHead className="font-bold text-white uppercase tracking-wider text-sm border-r border-white/20">Customer ID</TableHead>
                        <TableHead className="font-bold text-white uppercase tracking-wider text-sm border-r border-white/20">Subscription ID</TableHead>
                        <TableHead className="font-bold text-white uppercase tracking-wider text-sm border-r border-white/20">Status</TableHead>
                        <TableHead className="font-bold text-white uppercase tracking-wider text-sm border-r border-white/20">Billing Period</TableHead>
                        <TableHead className="font-bold text-white uppercase tracking-wider text-sm">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-16">
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <CreditCard className="h-8 w-8 text-purple-300" />
                              </div>
                              <div className="space-y-2">
                                <p className="text-white text-lg font-semibold">No subscriptions found</p>
                                <p className="text-purple-200/60 text-sm">Customer subscriptions will appear here</p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        subscriptions.map((subscription) => (
                          <TableRow 
                            key={subscription.id} 
                            className="border-b border-white/10 hover:bg-white/10 transition-all duration-300 group"
                          >
                            <TableCell className="py-4 border-r border-white/10">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-lg flex items-center justify-center">
                                  <CreditCard className="h-4 w-4 text-purple-300" />
                                </div>
                                <span className="font-mono text-purple-100 text-sm">{subscription.stripe_customer_id?.slice(0, 8)}...</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-purple-100 border-r border-white/10">
                              <span className="font-mono text-purple-200/80 text-sm">{subscription.stripe_subscription_id?.slice(0, 8)}...</span>
                            </TableCell>
                            <TableCell className="border-r border-white/10">
                              <Badge className={`${getSubscriptionStatusColor(subscription.status)} border-0 backdrop-blur-xl px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                                {subscription.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-purple-200/80 border-r border-white/10">
                              <span className="font-medium">
                                {subscription.current_period_start ? new Date(subscription.current_period_start).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                }) : 'N/A'} - {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                }) : 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell className="text-purple-200/80">
                              <span className="font-medium">
                                {new Date(subscription.created_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-500">
                <CardHeader className="backdrop-blur-xl bg-white/5 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl flex items-center justify-center">
                          <Eye className="h-4 w-4 text-white" />
                        </div>
                        Recent Visitors
                      </CardTitle>
                      <CardDescription className="text-orange-200/70">
                        Latest website activity and user behavior patterns
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="backdrop-blur-xl bg-orange-500/20 border-orange-400/50 text-orange-200 text-xs font-semibold px-3 py-1">
                      Last {visitors.length} visitors
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {visitors.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-400/30 to-red-400/30 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 mx-auto mb-4">
                          <Eye className="h-8 w-8 text-orange-300" />
                        </div>
                        <p className="text-orange-200/60 text-lg font-semibold">No visitor data available</p>
                        <p className="text-orange-200/40 text-sm">Website activity will appear here</p>
                      </div>
                    ) : (
                      visitors.slice(0, 10).map((visitor, index) => (
                        <div 
                          key={visitor.id} 
                          className="flex items-center justify-between p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                          tabIndex={0}
                          role="button"
                          aria-label={`Visitor ${index + 1}: ${visitor.browser} on ${visitor.os}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400/30 to-red-400/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-orange-500/30">
                              <Users className="h-5 w-5 text-orange-300" />
                            </div>
                            <div>
                              <p className="font-semibold text-white">{visitor.browser} on {visitor.os}</p>
                              <p className="text-orange-200/70 text-sm">{visitor.device_type} • {visitor.country || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-orange-100 font-semibold">
                              {visitor.last_seen_at ? new Date(visitor.last_seen_at).toLocaleDateString() : 'N/A'}
                            </p>
                            <p className="text-orange-200/60 text-sm">{visitor.total_visits} visits</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-500">
                <CardHeader className="backdrop-blur-xl bg-white/5 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl flex items-center justify-center">
                          <BarChart3 className="h-4 w-4 text-white" />
                        </div>
                        Performance Metrics
                      </CardTitle>
                      <CardDescription className="text-green-200/70">
                        Key website performance indicators and analytics
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-green-200 transition-all duration-300 rounded-xl flex items-center gap-2">
                      <Settings className="h-3 w-3" />
                      Configure
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 backdrop-blur-xl bg-green-500/10 border border-green-500/30 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Conversion Rate</p>
                          <p className="text-green-200/70 text-sm">Leads to customers</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-300">{stats.conversionRate}%</p>
                        <p className="text-green-200/60 text-sm">+2.3% from last month</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 backdrop-blur-xl bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Avg. Session Duration</p>
                          <p className="text-blue-200/70 text-sm">Time on site</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-300">{stats.avgSessionDuration}</p>
                        <p className="text-blue-200/60 text-sm">+15s from last month</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 backdrop-blur-xl bg-purple-500/10 border border-purple-500/30 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                          <Eye className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Page Views per Session</p>
                          <p className="text-purple-200/70 text-sm">Engagement metric</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-purple-300">{stats.pageViewsPerSession}</p>
                        <p className="text-purple-200/60 text-sm">+0.4 from last month</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 backdrop-blur-xl bg-orange-500/10 border border-orange-500/30 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                          <Activity className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Bounce Rate</p>
                          <p className="text-orange-200/70 text-sm">Single page visits</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-orange-300">{stats.bounceRate}%</p>
                        <p className="text-orange-200/60 text-sm">-3.2% from last month</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="feature-requests" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
              <CardHeader className="backdrop-blur-xl bg-white/5 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                        <Lightbulb className="h-4 w-4 text-white" />
                      </div>
                      Feature Requests Management
                    </CardTitle>
                    <CardDescription className="text-purple-200/80">
                      Manage user-submitted feature requests and track development progress
                    </CardDescription>
                  </div>
                  <Link href="/admin/feature-requests">
                    <Button className="backdrop-blur-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30">
                      Manage Feature Requests
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Lightbulb className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Feature Requests Hub</h3>
                  <p className="text-purple-200/80 mb-6 max-w-md mx-auto">
                    View and manage all user-submitted feature requests, track progress, and prioritize development efforts.
                  </p>
                  <Link href="/admin/feature-requests">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      Open Feature Requests Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
