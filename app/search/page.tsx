import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Search as SearchIcon, FileText, Users, Settings, TrendingUp } from "lucide-react"

const searchResults = [
  {
    title: "Getting Started with KiTS Hub",
    description: "Learn the basics of setting up your account and first steps",
    category: "Documentation",
    icon: FileText,
    href: "/docs/getting-started"
  },
  {
    title: "CRM Features Overview",
    description: "Complete guide to customer relationship management features",
    category: "CRM",
    icon: Users,
    href: "/crm/features"
  },
  {
    title: "Analytics Dashboard Setup",
    description: "How to configure and use your analytics dashboard",
    category: "Analytics",
    icon: TrendingUp,
    href: "/analytics/setup"
  },
  {
    title: "Account Settings",
    description: "Manage your account settings and preferences",
    category: "Settings",
    icon: Settings,
    href: "/account/settings"
  }
]

const popularSearches = [
  "Getting started",
  "CRM setup",
  "Analytics guide",
  "Pricing plans",
  "API documentation",
  "Integration help"
]

export default function Search() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <SearchIcon className="w-16 h-16 text-indigo-400" />
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-6">
              Search KiTS Hub
            </h1>
            
            <p className="text-xl text-zinc-400 mb-8">
              Find documentation, features, and resources
            </p>
            
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-4 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search for features, documentation, or help..."
                  className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 text-lg"
                  autoFocus
                />
                <Button className="absolute right-2 top-2 rounded-full">
                  Search
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-6">Popular Searches</h2>
            <div className="flex flex-wrap gap-3">
              {popularSearches.map((search) => (
                <Button key={search} variant="outline" className="rounded-full">
                  {search}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6">Quick Links</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {searchResults.map((result) => (
                <Link key={result.title} href={result.href}>
                  <div className="bg-zinc-900 rounded-lg p-6 hover:bg-zinc-800 transition-colors">
                    <div className="flex items-start mb-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <result.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {result.title}
                        </h3>
                        <p className="text-zinc-400 text-sm mb-2">
                          {result.description}
                        </p>
                        <span className="text-xs text-indigo-400">
                          {result.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
