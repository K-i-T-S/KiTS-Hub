import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Clock, Users, Video, ArrowRight, PlayCircle, Bell } from "lucide-react"

const upcomingWebinars = [
  {
    id: 1,
    title: "CRM Best Practices for 2025",
    description: "Learn the latest CRM strategies and techniques to boost your customer relationships.",
    date: "2025-01-15",
    time: "2:00 PM EST",
    duration: "60 min",
    speaker: "Sarah Johnson",
    role: "CRM Expert",
    attendees: 245,
    maxAttendees: 500,
    category: "CRM",
    level: "Intermediate"
  },
  {
    id: 2,
    title: "POS System Optimization",
    description: "Discover how to optimize your point of sale system for maximum efficiency and sales.",
    date: "2025-01-18",
    time: "3:00 PM EST",
    duration: "45 min",
    speaker: "Mike Chen",
    role: "Retail Specialist",
    attendees: 189,
    maxAttendees: 300,
    category: "POS",
    level: "Beginner"
  },
  {
    id: 3,
    title: "Advanced HR Analytics",
    description: "Deep dive into HR analytics and how to use data to improve workforce management.",
    date: "2025-01-22",
    time: "1:00 PM EST",
    duration: "75 min",
    speaker: "Dr. Emily Rodriguez",
    role: "HR Analytics Director",
    attendees: 156,
    maxAttendees: 250,
    category: "HR",
    level: "Advanced"
  }
]

const pastWebinars = [
  {
    id: 4,
    title: "Year-End Accounting Checklist",
    description: "Essential accounting tasks to complete before year-end.",
    date: "2024-12-20",
    duration: "60 min",
    speaker: "John Smith",
    role: "CFO",
    views: "1.2k",
    category: "Accounting",
    recordingAvailable: true
  },
  {
    id: 5,
    title: "Business Intelligence Dashboard Setup",
    description: "Create powerful dashboards to track your KPIs.",
    date: "2024-12-15",
    duration: "45 min",
    speaker: "Lisa Wang",
    role: "Data Analyst",
    views: "980",
    category: "Analytics",
    recordingAvailable: true
  },
  {
    id: 6,
    title: "Employee Onboarding Automation",
    description: "Streamline your onboarding process with automation.",
    date: "2024-12-10",
    duration: "55 min",
    speaker: "Tom Davis",
    role: "HR Manager",
    views: "750",
    category: "HR",
    recordingAvailable: true
  }
]

const categories = ["All", "CRM", "POS", "HR", "Accounting", "Analytics"]

export default function Webinars() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Live Webinars & Workshops
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Join expert-led sessions to learn best practices and get your questions answered in real-time.
          </p>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Webinars */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8">Upcoming Webinars</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingWebinars.map((webinar) => (
              <article
                key={webinar.id}
                className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-colors"
              >
                <div className="relative aspect-video bg-zinc-800">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                      Live Soon
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {webinar.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Calendar className="w-16 h-16 text-white/60" />
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-zinc-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(webinar.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{webinar.time}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {webinar.title}
                  </h3>
                  
                  <p className="text-zinc-400 mb-4 line-clamp-2">
                    {webinar.description}
                  </p>
                  
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-zinc-700 rounded-full mr-3"></div>
                    <div>
                      <p className="text-white font-medium">{webinar.speaker}</p>
                      <p className="text-zinc-400 text-sm">{webinar.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-zinc-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{webinar.attendees}/{webinar.maxAttendees}</span>
                    </div>
                    <span>{webinar.duration}</span>
                  </div>
                  
                  <div className="w-full bg-zinc-800 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(webinar.attendees / webinar.maxAttendees) * 100}%` }}
                    ></div>
                  </div>
                  
                  <Button className="w-full rounded-full">
                    Register Now
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Past Webinars */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8">Past Webinars</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pastWebinars.map((webinar) => (
              <article
                key={webinar.id}
                className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-colors"
              >
                <div className="relative aspect-video bg-zinc-800">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-600/20 to-gray-600/20" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                      Recording Available
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {webinar.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-white/80" />
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-zinc-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(webinar.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Video className="w-4 h-4" />
                      <span>{webinar.views} views</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {webinar.title}
                  </h3>
                  
                  <p className="text-zinc-400 mb-4 line-clamp-2">
                    {webinar.description}
                  </p>
                  
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-zinc-700 rounded-full mr-3"></div>
                    <div>
                      <p className="text-white font-medium">{webinar.speaker}</p>
                      <p className="text-zinc-400 text-sm">{webinar.role}</p>
                    </div>
                  </div>
                  
                  <Link
                    href={`/webinars/${webinar.id}/recording`}
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Watch Recording
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-4xl text-center">
          <Bell className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Never Miss a Webinar
          </h2>
          <p className="text-zinc-400 mb-8">
            Get notified about upcoming webinars and exclusive content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
            />
            <Button className="rounded-full">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
