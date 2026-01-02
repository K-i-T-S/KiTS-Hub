import { supabase } from './supabase'
import { Database } from '@/types/database'

type Visitor = Database['public']['Tables']['visitors']['Row']
type PageView = Database['public']['Tables']['page_views']['Row']
type WebsiteEvent = Database['public']['Tables']['website_events']['Row']

class AnalyticsTracker {
  private visitorId: string | null = null
  private sessionId: string
  private pageStartTime: number

  constructor() {
    this.sessionId = this.generateSessionId()
    this.pageStartTime = Date.now()
    this.initializeVisitor()
  }

  private generateSessionId(): string {
    // Check if session exists in sessionStorage
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('visitor_session_id')
      if (!sessionId) {
        sessionId = crypto.randomUUID()
        sessionStorage.setItem('visitor_session_id', sessionId)
      }
      return sessionId
    }
    return crypto.randomUUID()
  }

  private async initializeVisitor() {
    if (typeof window === 'undefined' || !supabase) return

    try {
      // Check if visitor already exists for this session
      const { data: existingVisitor } = await supabase
        .from('visitors')
        .select('*')
        .eq('session_id', this.sessionId)
        .single()

      if (existingVisitor) {
        this.visitorId = existingVisitor.id
        // Update last seen and visit count
        await supabase
          .from('visitors')
          .update({
            last_seen_at: new Date().toISOString(),
            total_visits: existingVisitor.total_visits + 1,
          })
          .eq('id', existingVisitor.id)
      } else {
        // Create new visitor
        const visitorData = this.getVisitorData()
        const { data: newVisitor } = await supabase
          .from('visitors')
          .insert(visitorData)
          .select()
          .single()

        this.visitorId = newVisitor?.id || null
      }
    } catch (error) {
      console.error('Error initializing visitor:', error)
    }
  }

  private getVisitorData(): Omit<Visitor, 'id' | 'created_at' | 'updated_at'> {
    const userAgent = navigator.userAgent
    const referrer = document.referrer || null
    
    // Basic device detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const deviceType = isMobile ? 'mobile' : 'desktop'
    
    // Basic browser detection
    let browser = 'unknown'
    if (userAgent.includes('Chrome')) browser = 'chrome'
    else if (userAgent.includes('Firefox')) browser = 'firefox'
    else if (userAgent.includes('Safari')) browser = 'safari'
    else if (userAgent.includes('Edge')) browser = 'edge'

    // Basic OS detection
    let os = 'unknown'
    if (userAgent.includes('Windows')) os = 'windows'
    else if (userAgent.includes('Mac')) os = 'macos'
    else if (userAgent.includes('Linux')) os = 'linux'
    else if (userAgent.includes('Android')) os = 'android'
    else if (userAgent.includes('iOS')) os = 'ios'

    return {
      session_id: this.sessionId,
      ip_address: null, // You might want to get this from a service
      user_agent: userAgent,
      referrer,
      landing_page: window.location.href,
      country: null,
      city: null,
      device_type: deviceType,
      browser,
      os,
      visitor_type: 'anonymous',
      user_id: null,
      first_seen_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      total_visits: 1,
      total_duration_seconds: 0,
    }
  }

  async trackPageView(pageUrl?: string, pageTitle?: string) {
    if (!this.visitorId || !supabase) return

    const url = pageUrl || window.location.href
    const title = pageTitle || document.title
    const category = this.getPageCategory(url)

    try {
      await supabase.from('page_views').insert({
        visitor_id: this.visitorId,
        page_url: url,
        page_title: title,
        page_category: category,
        time_on_page_seconds: null, // Will be updated when page is unloaded
        scrolled_percentage: 0,
      })

      // Reset page start time
      this.pageStartTime = Date.now()

      // Add page unload listener to track time on page
      if (typeof window !== 'undefined') {
        const handlePageUnload = () => {
          const timeOnPage = Math.floor((Date.now() - this.pageStartTime) / 1000)
          this.updatePageViewDuration(url, timeOnPage)
        }

        window.addEventListener('beforeunload', handlePageUnload)
        window.addEventListener('pagehide', handlePageUnload)
      }
    } catch (error) {
      console.error('Error tracking page view:', error)
    }
  }

  private async updatePageViewDuration(pageUrl: string, durationSeconds: number) {
    if (!this.visitorId || !supabase) return

    try {
      await supabase
        .from('page_views')
        .update({ time_on_page_seconds: durationSeconds })
        .eq('visitor_id', this.visitorId)
        .eq('page_url', pageUrl)
        .is('time_on_page_seconds', null)
    } catch (error) {
      console.error('Error updating page view duration:', error)
    }
  }

  async trackEvent(eventType: string, eventName: string, properties?: Record<string, unknown>) {
    if (!this.visitorId || !supabase) return

    try {
      await supabase.from('website_events').insert({
        visitor_id: this.visitorId,
        event_type: eventType,
        event_name: eventName,
        properties,
        page_url: window.location.href,
      })
    } catch (error) {
      console.error('Error tracking event:', error)
    }
  }

  async trackScrollDepth() {
    if (!this.visitorId || !supabase) return

    const maxScroll = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    )

    const scrollPercentage = (window.scrollY / (maxScroll - window.innerHeight)) * 100

    // Update the most recent page view with scroll percentage
    try {
      await supabase
        .from('page_views')
        .update({ scrolled_percentage: Math.min(scrollPercentage, 100) })
        .eq('visitor_id', this.visitorId)
        .eq('page_url', window.location.href)
        .order('created_at', { ascending: false })
        .limit(1)
    } catch (error) {
      console.error('Error tracking scroll depth:', error)
    }
  }

  private getPageCategory(url: string): Database['public']['Enums']['page_category'] {
    if (url.includes('/about')) return 'about'
    if (url.includes('/pricing')) return 'pricing'
    if (url.includes('/contact')) return 'contact'
    if (url.includes('/dashboard')) return 'dashboard'
    if (url.includes('/admin')) return 'admin'
    if (url.includes('/blog')) return 'blog'
    if (url === '/' || url.includes('/home')) return 'home'
    return 'other'
  }

  async identifyUser(userId: string) {
    if (!this.visitorId || !supabase) return

    try {
      await supabase
        .from('visitors')
        .update({
          user_id: userId,
          visitor_type: 'authenticated',
        })
        .eq('id', this.visitorId)

      // Track user identification event
      await this.trackEvent('auth', 'user_identified', { userId })
    } catch (error) {
      console.error('Error identifying user:', error)
    }
  }

  async trackFormSubmission(formName: string, data: Record<string, unknown>) {
    await this.trackEvent('form', 'submission', { formName, ...data })
  }

  async trackButtonClick(buttonName: string, buttonLocation: string) {
    await this.trackEvent('interaction', 'button_click', { 
      buttonName, 
      buttonLocation 
    })
  }

  async trackDownload(fileName: string, fileType: string) {
    await this.trackEvent('download', 'file_download', { fileName, fileType })
  }
}

// Create singleton instance
export const analytics = new AnalyticsTracker()

// Hook for React components
export function useAnalytics() {
  return {
    trackPageView: analytics.trackPageView.bind(analytics),
    trackEvent: analytics.trackEvent.bind(analytics),
    trackScrollDepth: analytics.trackScrollDepth.bind(analytics),
    identifyUser: analytics.identifyUser.bind(analytics),
    trackFormSubmission: analytics.trackFormSubmission.bind(analytics),
    trackButtonClick: analytics.trackButtonClick.bind(analytics),
    trackDownload: analytics.trackDownload.bind(analytics),
  }
}
