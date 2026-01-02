import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Book, FileText, Video, Code, Settings, Users, ShoppingCart, Calculator, Brain, ArrowRight } from "lucide-react"

const docCategories = [
  {
    title: "Getting Started",
    description: "Quick start guides and setup instructions",
    icon: Book,
    color: "bg-blue-600",
    articles: [
      { title: "Installation Guide", href: "/docs/installation" },
      { title: "Account Setup", href: "/docs/account-setup" },
      { title: "Dashboard Overview", href: "/docs/dashboard" },
      { title: "Basic Configuration", href: "/docs/configuration" }
    ]
  },
  {
    title: "CRM Documentation",
    description: "Customer relationship management features",
    icon: Users,
    color: "bg-green-600",
    articles: [
      { title: "Contact Management", href: "/docs/crm/contacts" },
      { title: "Lead Tracking", href: "/docs/crm/leads" },
      { title: "Sales Pipeline", href: "/docs/crm/pipeline" },
      { title: "CRM Analytics", href: "/docs/crm/analytics" }
    ]
  },
  {
    title: "POS System",
    description: "Point of sale and payment processing",
    icon: ShoppingCart,
    color: "bg-purple-600",
    articles: [
      { title: "POS Setup", href: "/docs/pos/setup" },
      { title: "Payment Methods", href: "/docs/pos/payments" },
      { title: "Inventory Integration", href: "/docs/pos/inventory" },
      { title: "Sales Reports", href: "/docs/pos/reports" }
    ]
  },
  {
    title: "HR Management",
    description: "Human resources and employee management",
    icon: Settings,
    color: "bg-orange-600",
    articles: [
      { title: "Employee Onboarding", href: "/docs/hr/onboarding" },
      { title: "Payroll Setup", href: "/docs/hr/payroll" },
      { title: "Time Tracking", href: "/docs/hr/time-tracking" },
      { title: "Performance Reviews", href: "/docs/hr/performance" }
    ]
  },
  {
    title: "Accounting",
    description: "Financial management and accounting",
    icon: Calculator,
    color: "bg-red-600",
    articles: [
      { title: "Chart of Accounts", href: "/docs/accounting/accounts" },
      { title: "Invoicing", href: "/docs/accounting/invoicing" },
      { title: "Expense Tracking", href: "/docs/accounting/expenses" },
      { title: "Financial Reports", href: "/docs/accounting/reports" }
    ]
  },
  {
    title: "Analytics",
    description: "Business intelligence and data analytics",
    icon: Brain,
    color: "bg-indigo-600",
    articles: [
      { title: "Dashboard Setup", href: "/docs/analytics/dashboard" },
      { title: "Custom Reports", href: "/docs/analytics/reports" },
      { title: "Data Export", href: "/docs/analytics/export" },
      { title: "API Integration", href: "/docs/analytics/api" }
    ]
  }
]

const quickLinks = [
  { title: "API Reference", href: "/docs/api", icon: Code },
  { title: "Video Tutorials", href: "/docs/videos", icon: Video },
  { title: "FAQ", href: "/docs/faq", icon: FileText }
]

export default function Docs() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Documentation Center
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Comprehensive guides and resources to help you get the most out of KiTS Hub.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <input
                type="search"
                placeholder="Search documentation..."
                className="w-full px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
              />
              <Button className="absolute right-2 top-2 rounded-full">
                Search
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <link.icon className="w-4 h-4 text-blue-400" />
                <span className="text-white">{link.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {docCategories.map((category) => (
              <div
                key={category.title}
                className="bg-zinc-900 rounded-lg p-6 hover:bg-zinc-800 transition-colors"
              >
                <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">
                  {category.title}
                </h3>
                
                <p className="text-zinc-400 mb-6">
                  {category.description}
                </p>
                
                <ul className="space-y-3">
                  {category.articles.map((article) => (
                    <li key={article.title}>
                      <Link
                        href={article.href}
                        className="flex items-center justify-between text-zinc-300 hover:text-white transition-colors"
                      >
                        <span>{article.title}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Need More Help?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-zinc-800 rounded-lg p-6">
              <Video className="w-8 h-8 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Video Tutorials
              </h3>
              <p className="text-zinc-400 mb-4">
                Step-by-step video guides for common tasks.
              </p>
              <Button variant="outline" size="sm" className="rounded-full">
                Watch Videos
              </Button>
            </div>
            
            <div className="bg-zinc-800 rounded-lg p-6">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Community Forum
              </h3>
              <p className="text-zinc-400 mb-4">
                Get help from other KiTS Hub users.
              </p>
              <Button variant="outline" size="sm" className="rounded-full">
                Join Community
              </Button>
            </div>
            
            <div className="bg-zinc-800 rounded-lg p-6">
              <FileText className="w-8 h-8 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Support Center
              </h3>
              <p className="text-zinc-400 mb-4">
                Contact our support team for assistance.
              </p>
              <Button variant="outline" size="sm" className="rounded-full">
                Get Support
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
