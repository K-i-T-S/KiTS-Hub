import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Puzzle, CheckCircle, ArrowRight } from "lucide-react"

const integrations = [
  {
    name: "Google Analytics",
    logo: "/integrations/google.png",
    description: "Web analytics and reporting",
    category: "Analytics",
    status: "Available"
  },
  {
    name: "Salesforce",
    logo: "/integrations/salesforce.png", 
    description: "CRM data synchronization",
    category: "CRM",
    status: "Available"
  },
  {
    name: "Tableau",
    logo: "/integrations/tableau.png",
    description: "Data visualization and dashboards",
    category: "Business Intelligence",
    status: "Available"
  },
  {
    name: "Power BI",
    logo: "/integrations/powerbi.png",
    description: "Microsoft business analytics",
    category: "Business Intelligence", 
    status: "Available"
  },
  {
    name: "Mixpanel",
    logo: "/integrations/mixpanel.png",
    description: "Product analytics platform",
    category: "Analytics",
    status: "Available"
  },
  {
    name: "Segment",
    logo: "/integrations/segment.png",
    description: "Customer data platform",
    category: "Data",
    status: "Available"
  },
  {
    name: "Slack",
    logo: "/integrations/slack.png",
    description: "Team communication and notifications",
    category: "Communication",
    status: "Available"
  },
  {
    name: "Microsoft Teams",
    logo: "/integrations/teams.png",
    description: "Collaboration and meetings",
    category: "Communication",
    status: "Available"
  },
  {
    name: "QuickBooks",
    logo: "/integrations/quickbooks.png",
    description: "Accounting and financial management",
    category: "Accounting",
    status: "Coming Soon"
  },
  {
    name: "Xero",
    logo: "/integrations/xero.png",
    description: "Cloud-based accounting software",
    category: "Accounting",
    status: "Coming Soon"
  },
  {
    name: "Shopify",
    logo: "/integrations/shopify.png",
    description: "E-commerce platform integration",
    category: "E-commerce",
    status: "Available"
  },
  {
    name: "WooCommerce",
    logo: "/integrations/woocommerce.png",
    description: "WordPress e-commerce plugin",
    category: "E-commerce",
    status: "Coming Soon"
  }
]

const categories = ["All", "Analytics", "CRM", "Business Intelligence", "Data", "Communication", "Accounting", "E-commerce"]

export default function Integrations() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Puzzle className="w-16 h-16 text-indigo-400" />
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-6">
              Integrations & Connections
            </h1>
            
            <p className="text-xl text-zinc-400 mb-8">
              Connect KiTS Hub with your favorite tools and services to streamline your workflow.
            </p>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="flex flex-wrap gap-2">
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <div key={integration.name} className="bg-zinc-900 rounded-lg p-6 hover:bg-zinc-800 transition-colors">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {integration.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {integration.name}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        integration.status === 'Available' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {integration.status}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-2">
                      {integration.description}
                    </p>
                    <span className="text-xs text-indigo-400">
                      {integration.category}
                    </span>
                  </div>
                </div>
                
                {integration.status === 'Available' ? (
                  <Button className="w-full rounded-full" size="sm">
                    Connect
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full rounded-full" size="sm">
                    Join Waitlist
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Don&apos;t see the integration you need?
            </h2>
            <p className="text-zinc-400 mb-8">
              We&apos;re always adding new integrations. Let us know what you&apos;d like to see next.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Suggest an integration..."
                className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
              />
              <Button className="rounded-full">
                Suggest
              </Button>
            </div>
          </div>
          
          <div className="mt-16 bg-zinc-900 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Build Your Own Integration
              </h2>
              <p className="text-zinc-400 mb-6">
                Use our comprehensive API and webhooks to build custom integrations tailored to your needs.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <h3 className="text-white font-medium mb-2">RESTful API</h3>
                  <p className="text-zinc-400 text-sm">
                    Complete API access with comprehensive documentation
                  </p>
                </div>
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <h3 className="text-white font-medium mb-2">Webhooks</h3>
                  <p className="text-zinc-400 text-sm">
                    Real-time event notifications to your systems
                  </p>
                </div>
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <h3 className="text-white font-medium mb-2">SDK Support</h3>
                  <p className="text-zinc-400 text-sm">
                    SDKs for popular programming languages
                  </p>
                </div>
              </div>
              <div className="flex justify-center">
                <Link href="/docs/api">
                  <Button className="rounded-full">
                    View API Documentation
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
