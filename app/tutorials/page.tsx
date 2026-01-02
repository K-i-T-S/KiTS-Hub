import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlayCircle, Clock, Users, Star, ArrowRight, BookOpen } from "lucide-react"

const tutorials = [
  {
    id: 1,
    title: "Getting Started with KiTS Hub",
    description: "Learn the basics of setting up your account and navigating the platform.",
    duration: "15 min",
    level: "Beginner",
    views: "2.3k",
    rating: 4.8,
    thumbnail: "/tutorials/getting-started.jpg",
    category: "Getting Started"
  },
  {
    id: 2,
    title: "CRM Setup and Configuration",
    description: "Complete guide to setting up your CRM system for maximum efficiency.",
    duration: "25 min",
    level: "Intermediate",
    views: "1.8k",
    rating: 4.9,
    thumbnail: "/tutorials/crm-setup.jpg",
    category: "CRM"
  },
  {
    id: 3,
    title: "POS System Implementation",
    description: "Step-by-step tutorial for implementing your point of sale system.",
    duration: "20 min",
    level: "Intermediate",
    views: "1.5k",
    rating: 4.7,
    thumbnail: "/tutorials/pos-implementation.jpg",
    category: "POS"
  },
  {
    id: 4,
    title: "HR Management Best Practices",
    description: "Learn how to effectively manage employees using our HR tools.",
    duration: "30 min",
    level: "Advanced",
    views: "1.2k",
    rating: 4.6,
    thumbnail: "/tutorials/hr-best-practices.jpg",
    category: "HR"
  },
  {
    id: 5,
    title: "Accounting Basics in KiTS Hub",
    description: "Master the fundamentals of accounting and financial management.",
    duration: "35 min",
    level: "Beginner",
    views: "2.1k",
    rating: 4.8,
    thumbnail: "/tutorials/accounting-basics.jpg",
    category: "Accounting"
  },
  {
    id: 6,
    title: "Advanced Analytics and Reporting",
    description: "Deep dive into creating custom reports and analyzing business data.",
    duration: "40 min",
    level: "Advanced",
    views: "980",
    rating: 4.9,
    thumbnail: "/tutorials/advanced-analytics.jpg",
    category: "Analytics"
  }
]

const categories = ["All", "Getting Started", "CRM", "POS", "HR", "Accounting", "Analytics"]
const levels = ["All", "Beginner", "Intermediate", "Advanced"]

export default function Tutorials() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Video Tutorials
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Step-by-step video guides to help you master every aspect of KiTS Hub.
          </p>
          
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex flex-wrap justify-center gap-2">
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
          
          <div className="flex flex-wrap justify-center gap-2">
            {levels.map((level) => (
              <Button
                key={level}
                variant={level === "All" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {level}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Tutorials Grid */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tutorials.map((tutorial) => (
              <article
                key={tutorial.id}
                className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-colors group"
              >
                <div className="relative aspect-video bg-zinc-800">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-white/80 group-hover:text-white transition-colors" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {tutorial.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/60 px-2 py-1 rounded text-white text-sm">
                    {tutorial.duration}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-zinc-400 mb-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      tutorial.level === 'Beginner' ? 'bg-green-600/20 text-green-400' :
                      tutorial.level === 'Intermediate' ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-red-600/20 text-red-400'
                    }`}>
                      {tutorial.level}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{tutorial.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {tutorial.title}
                  </h3>
                  
                  <p className="text-zinc-400 mb-4 line-clamp-2">
                    {tutorial.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-zinc-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{tutorial.views} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{tutorial.duration}</span>
                    </div>
                  </div>
                  
                  <Link
                    href={`/tutorials/${tutorial.id}`}
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Watch Tutorial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          
          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="rounded-full">
              Load More Tutorials
            </Button>
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Recommended Learning Paths
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-zinc-800 rounded-lg p-6">
              <BookOpen className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">
                Beginner Track
              </h3>
              <p className="text-zinc-400 mb-4">
                Perfect for new users. Learn the essentials in just 2 hours.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-zinc-300">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs mr-3">1</span>
                  Getting Started
                </li>
                <li className="flex items-center text-zinc-300">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs mr-3">2</span>
                  Accounting Basics
                </li>
                <li className="flex items-center text-zinc-300">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs mr-3">3</span>
                  CRM Fundamentals
                </li>
              </ul>
              <Button className="rounded-full w-full">
                Start Learning
              </Button>
            </div>
            
            <div className="bg-zinc-800 rounded-lg p-6">
              <BookOpen className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">
                Advanced Track
              </h3>
              <p className="text-zinc-400 mb-4">
                Deep dive into advanced features and optimization techniques.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-zinc-300">
                  <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs mr-3">1</span>
                  Advanced Analytics
                </li>
                <li className="flex items-center text-zinc-300">
                  <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs mr-3">2</span>
                  HR Best Practices
                </li>
                <li className="flex items-center text-zinc-300">
                  <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs mr-3">3</span>
                  System Integration
                </li>
              </ul>
              <Button variant="outline" className="rounded-full w-full">
                View Track
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
