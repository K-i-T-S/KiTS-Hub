import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Handshake, Globe, Zap, Users, Heart, Target, CheckCircle, Star } from "lucide-react"

const partnerTypes = [
  {
    title: "Technology Partners",
    description: "Integrate your software with KiTS Hub to reach thousands of businesses",
    icon: Zap,
    color: "bg-blue-600",
    benefits: ["API access", "Co-marketing opportunities", "Joint sales initiatives", "Technical support"]
  },
  {
    title: "Reseller Partners",
    description: "Sell KiTS Hub to your clients and earn recurring revenue",
    icon: Users,
    color: "bg-green-600",
    benefits: ["Competitive margins", "Sales training", "Marketing materials", "Lead generation"]
  },
  {
    title: "Integration Partners",
    description: "Build and maintain integrations between KiTS Hub and other platforms",
    icon: Globe,
    color: "bg-purple-600",
    benefits: ["Development resources", "API documentation", "Testing environment", "Customer support"]
  },
  {
    title: "Referral Partners",
    description: "Refer customers to KiTS Hub and earn commissions for successful sign-ups",
    icon: Handshake,
    color: "bg-orange-600",
    benefits: ["Generous commissions", "Easy tracking", "Marketing support", "No minimum commitments"]
  }
]

const featuredPartners = [
  {
    name: "Stripe",
    logo: "/partners/stripe.png",
    description: "Payment processing integration for seamless transactions",
    category: "Technology Partner",
    tier: "Premium"
  },
  {
    name: "QuickBooks",
    logo: "/partners/quickbooks.png",
    description: "Accounting software integration for financial management",
    category: "Integration Partner",
    tier: "Premium"
  },
  {
    name: "Slack",
    logo: "/partners/slack.png",
    description: "Team communication and collaboration tools",
    category: "Technology Partner",
    tier: "Standard"
  },
  {
    name: "Google Workspace",
    logo: "/partners/google.png",
    description: "Productivity and collaboration suite integration",
    category: "Integration Partner",
    tier: "Premium"
  },
  {
    name: "Zoom",
    logo: "/partners/zoom.png",
    description: "Video conferencing and meeting solutions",
    category: "Technology Partner",
    tier: "Standard"
  },
  {
    name: "Microsoft 365",
    logo: "/partners/microsoft.png",
    description: "Office productivity and business tools",
    category: "Integration Partner",
    tier: "Premium"
  }
]

const partnershipTiers = [
  {
    name: "Referral Partner",
    price: "Free",
    features: [
      "10-20% commission",
      "Basic tracking dashboard",
      "Marketing materials",
      "Email support"
    ],
    highlighted: false
  },
  {
    name: "Reseller Partner",
    price: "Starts at $500/mo",
    features: [
      "20-30% margin",
      "Advanced dashboard",
      "Co-branded materials",
      "Priority support",
      "Lead generation"
    ],
    highlighted: true
  },
  {
    name: "Strategic Partner",
    price: "Custom",
    features: [
      "30-40% margin",
      "White-label options",
      "Dedicated support",
      "Joint development",
      "Revenue sharing"
    ],
    highlighted: false
  }
]

const successMetrics = [
  { value: "500+", label: "Active Partners" },
  { value: "$2.5M+", label: "Partner Revenue" },
  { value: "50K+", label: "Joint Customers" },
  { value: "4.9/5", label: "Partner Satisfaction" }
]

export default function Partners() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Partner With KiTS Hub
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Join our ecosystem of trusted partners and help businesses thrive with integrated solutions.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="rounded-full">
              Become a Partner
            </Button>
            <Button variant="outline" className="rounded-full">
              Partner Portal Login
            </Button>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {successMetrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {metric.value}
                </div>
                <div className="text-zinc-400">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Partnership Opportunities
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnerTypes.map((type) => (
              <div
                key={type.title}
                className="bg-zinc-900 rounded-lg p-6 hover:bg-zinc-800 transition-colors"
              >
                <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mb-4`}>
                  <type.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-3">
                  {type.title}
                </h3>
                
                <p className="text-zinc-400 mb-6">
                  {type.description}
                </p>
                
                <ul className="space-y-2">
                  {type.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start text-sm text-zinc-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Partners */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Trusted Partners
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPartners.map((partner) => (
              <div
                key={partner.name}
                className="bg-zinc-800 rounded-lg p-6 hover:bg-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-zinc-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {partner.name.charAt(0)}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    partner.tier === 'Premium' 
                      ? 'bg-yellow-600/20 text-yellow-400' 
                      : 'bg-blue-600/20 text-blue-400'
                  }`}>
                    {partner.tier}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {partner.name}
                </h3>
                
                <p className="text-zinc-400 text-sm mb-3">
                  {partner.description}
                </p>
                
                <span className="text-zinc-400 text-sm">
                  {partner.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Tiers */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Partnership Tiers
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {partnershipTiers.map((tier) => (
              <div
                key={tier.name}
                className={`bg-zinc-900 rounded-lg p-8 hover:bg-zinc-800 transition-colors ${
                  tier.highlighted ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {tier.highlighted && (
                  <div className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full text-center mb-4">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-xl font-semibold text-white mb-2">
                  {tier.name}
                </h3>
                
                <div className="text-2xl font-bold text-white mb-6">
                  {tier.price}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start text-zinc-300">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full rounded-full ${
                    tier.highlighted ? 'bg-blue-500 hover:bg-blue-600' : ''
                  }`}
                  variant={tier.highlighted ? 'default' : 'outline'}
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Success */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Partner Success Stories
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-zinc-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-zinc-400 ml-2 text-sm">5.0</span>
              </div>
              
              <blockquote className="text-zinc-300 mb-4">
                &quot;Partnering with KiTS Hub has transformed our business. The integration was seamless, and we&apos;ve seen a 300% increase in joint customers.&quot;
              </blockquote>
              
              <div>
                <div className="text-white font-medium">Tech Solutions Inc.</div>
                <div className="text-zinc-400 text-sm">Technology Partner</div>
              </div>
            </div>
            
            <div className="bg-zinc-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-zinc-400 ml-2 text-sm">5.0</span>
              </div>
              
              <blockquote className="text-zinc-300 mb-4">
                &quot;The reseller program has provided us with a new revenue stream while helping our clients access the best business management platform.&quot;
              </blockquote>
              
              <div>
                <div className="text-white font-medium">Business Consulting Group</div>
                <div className="text-zinc-400 text-sm">Reseller Partner</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Partner With Us?
          </h2>
          <p className="text-zinc-400 mb-8">
            Join our ecosystem and start growing your business with KiTS Hub.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your business email"
              className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
            />
            <Button className="rounded-full">
              Apply Now
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
