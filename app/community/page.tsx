import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, MessageSquare, ThumbsUp, Calendar, ArrowRight, Search, TrendingUp, Award, HelpCircle } from "lucide-react"

const forumCategories = [
  {
    name: "General Discussion",
    description: "General topics about KiTS Hub and business management",
    icon: MessageSquare,
    color: "bg-blue-600",
    posts: 1234,
    topics: 89
  },
  {
    name: "CRM Support",
    description: "Get help with CRM features and best practices",
    icon: Users,
    color: "bg-green-600",
    posts: 856,
    topics: 67
  },
  {
    name: "POS System",
    description: "Point of sale setup, troubleshooting, and tips",
    icon: TrendingUp,
    color: "bg-purple-600",
    posts: 623,
    topics: 45
  },
  {
    name: "HR Management",
    description: "HR features, payroll, and employee management",
    icon: Award,
    color: "bg-orange-600",
    posts: 445,
    topics: 38
  },
  {
    name: "Accounting & Finance",
    description: "Financial management, accounting, and reporting",
    icon: Calendar,
    color: "bg-red-600",
    posts: 789,
    topics: 56
  },
  {
    name: "Feature Requests",
    description: "Suggest new features and vote on existing ideas",
    icon: HelpCircle,
    color: "bg-indigo-600",
    posts: 234,
    topics: 23
  }
]

const recentPosts = [
  {
    id: 1,
    title: "How to integrate CRM with email marketing?",
    author: "John Doe",
    avatar: "/avatars/john.jpg",
    category: "CRM Support",
    replies: 12,
    views: 234,
    lastActivity: "2 hours ago",
    isSolved: true
  },
  {
    id: 2,
    title: "Best practices for inventory management in POS",
    author: "Sarah Smith",
    avatar: "/avatars/sarah.jpg",
    category: "POS System",
    replies: 8,
    views: 156,
    lastActivity: "4 hours ago",
    isSolved: false
  },
  {
    id: 3,
    title: "Year-end accounting checklist",
    author: "Mike Johnson",
    avatar: "/avatars/mike.jpg",
    category: "Accounting & Finance",
    replies: 15,
    views: 445,
    lastActivity: "6 hours ago",
    isSolved: true
  },
  {
    id: 4,
    title: "Employee onboarding workflow automation",
    author: "Emily Chen",
    avatar: "/avatars/emily.jpg",
    category: "HR Management",
    replies: 6,
    views: 123,
    lastActivity: "1 day ago",
    isSolved: false
  }
]

const topContributors = [
  { name: "Alex Thompson", posts: 234, reputation: 1245, avatar: "/avatars/alex.jpg" },
  { name: "Maria Garcia", posts: 189, reputation: 987, avatar: "/avatars/maria.jpg" },
  { name: "David Lee", posts: 156, reputation: 756, avatar: "/avatars/david.jpg" },
  { name: "Lisa Wang", posts: 145, reputation: 678, avatar: "/avatars/lisa.jpg" }
]

export default function Community() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Community Forum
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Connect with other KiTS Hub users, share experiences, and get help from our community.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="search"
                placeholder="Search discussions, topics, and help..."
                className="w-full pl-12 pr-6 py-4 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="rounded-full">
              Start New Discussion
            </Button>
            <Button variant="outline" className="rounded-full">
              Browse Topics
            </Button>
            <Button variant="outline" className="rounded-full">
              Help Center
            </Button>
          </div>
        </div>
      </section>

      {/* Forum Stats */}
      <section className="pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-zinc-900 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">15.2k</div>
              <div className="text-zinc-400">Members</div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">4.8k</div>
              <div className="text-zinc-400">Discussions</div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">18.5k</div>
              <div className="text-zinc-400">Posts</div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">89%</div>
              <div className="text-zinc-400">Solved</div>
            </div>
          </div>
        </div>
      </section>

      {/* Forum Categories */}
      <section className="pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8">Forum Categories</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forumCategories.map((category) => (
              <Link
                key={category.name}
                href={`/community/${category.name.toLowerCase().replace(' ', '-')}`}
                className="bg-zinc-900 rounded-lg p-6 hover:bg-zinc-800 transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">
                  {category.name}
                </h3>
                
                <p className="text-zinc-400 mb-4">
                  {category.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-zinc-400">
                  <span>{category.topics} topics</span>
                  <span>{category.posts} posts</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Discussions */}
      <section className="pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Recent Discussions</h2>
            <Button variant="outline" className="rounded-full">
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <article
                key={post.id}
                className="bg-zinc-900 rounded-lg p-6 hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-400 text-sm">{post.category}</span>
                      {post.isSolved && (
                        <span className="bg-green-600/20 text-green-400 text-xs px-2 py-1 rounded-full">
                          Solved
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-2 hover:text-blue-400 transition-colors cursor-pointer">
                      {post.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-zinc-700 rounded-full"></div>
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.replies} replies</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{post.views} views</span>
                      </div>
                      <span>•</span>
                      <span>{post.lastActivity}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Top Contributors */}
      <section className="pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8">Top Contributors</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topContributors.map((contributor, index) => (
              <div
                key={contributor.name}
                className="bg-zinc-900 rounded-lg p-6 text-center hover:bg-zinc-800 transition-colors"
              >
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-zinc-700 rounded-full mx-auto"></div>
                  {index < 3 && (
                    <div className={`absolute -top-2 -right-2 w-8 h-8 ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                    } rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                      {index + 1}
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-1">
                  {contributor.name}
                </h3>
                
                <div className="space-y-1 text-sm text-zinc-400">
                  <div>{contributor.posts} posts</div>
                  <div>{contributor.reputation} reputation</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
