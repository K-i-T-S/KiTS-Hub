import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Target, TrendingUp, MessageSquare, Phone, Mail, Calendar, CheckCircle, ArrowRight, Star, Zap } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Contact Management",
    description: "Centralized database for all customer interactions and information",
    benefits: ["360-degree customer view", "Contact history tracking", "Custom fields and tags", "Duplicate detection"]
  },
  {
    icon: Target,
    title: "Lead Management",
    description: "Capture, qualify, and nurture leads through your sales pipeline",
    benefits: ["Lead scoring system", "Automated lead assignment", "Custom pipeline stages", "Lead source tracking"]
  },
  {
    icon: TrendingUp,
    title: "Sales Analytics",
    description: "Comprehensive reporting and insights to drive sales performance",
    benefits: ["Real-time dashboards", "Sales forecasting", "Conversion analytics", "Performance metrics"]
  },
  {
    icon: MessageSquare,
    title: "Communication Tracking",
    description: "Log and track all customer communications in one place",
    benefits: ["Email integration", "Call logging", "Meeting notes", "Communication history"]
  }
]

const integrations = [
  { name: "Gmail", logo: "/integrations/gmail.png", description: "Sync emails and contacts" },
  { name: "Outlook", logo: "/integrations/outlook.png", description: "Microsoft email integration" },
  { name: "Slack", logo: "/integrations/slack.png", description: "Team collaboration" },
  { name: "Zoom", logo: "/integrations/zoom.png", description: "Meeting integration" },
  { name: "LinkedIn", logo: "/integrations/linkedin.png", description: "Social selling" },
  { name: "Mailchimp", logo: "/integrations/mailchimp.png", description: "Email marketing" }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Sales Director",
    company: "Tech Solutions Inc.",
    content: "KiTS Hub CRM transformed our sales process. We've seen a 40% increase in conversion rates since implementation.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "CEO",
    company: "Growth Partners",
    content: "The best CRM we've ever used. Intuitive interface, powerful features, and excellent support.",
    rating: 5
  },
  {
    name: "Emily Davis",
    role: "Sales Manager",
    company: "Innovation Labs",
    content: "Our team productivity has doubled since switching to KiTS Hub. The automation features are game-changing.",
    rating: 5
  }
]

const pricing = [
  {
    name: "Starter",
    price: "$29",
    users: "Up to 5 users",
    features: [
      "Contact management",
      "Lead tracking",
      "Basic reporting",
      "Email integration",
      "Mobile app"
    ],
    highlighted: false
  },
  {
    name: "Professional",
    price: "$79",
    users: "Up to 20 users",
    features: [
      "Everything in Starter",
      "Advanced analytics",
      "Custom workflows",
      "API access",
      "Phone integration",
      "Custom fields"
    ],
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    users: "Unlimited users",
    features: [
      "Everything in Professional",
      "White-label options",
      "Dedicated support",
      "Custom integrations",
      "Advanced security",
      "SLA guarantee"
    ],
    highlighted: false
  }
]

export default function CRM() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <Users className="w-16 h-16 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            CRM Software
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Build stronger customer relationships with our powerful, intuitive CRM platform. Manage contacts, track leads, and close more deals.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="rounded-full">
              Start Free Trial
            </Button>
            <Button variant="outline" className="rounded-full">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Powerful CRM Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-zinc-900 rounded-lg p-6">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-400 mb-4">
                      {feature.description}
                    </p>
                  </div>
                </div>
                
                <ul className="space-y-2">
                  {feature.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start text-zinc-300">
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

      {/* Benefits */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose Our CRM?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">40%</div>
              <div className="text-zinc-400">Increase in Sales Conversion</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">60%</div>
              <div className="text-zinc-400">Reduction in Admin Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">85%</div>
              <div className="text-zinc-400">User Adoption Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Seamless Integrations
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <div key={integration.name} className="bg-zinc-900 rounded-lg p-6 flex items-center">
                <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-sm">
                    {integration.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {integration.name}
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    {integration.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button variant="outline" className="rounded-full">
              View All Integrations
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            What Our Customers Say
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-zinc-800 rounded-lg p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-zinc-300 mb-4">
                  {testimonial.content}
                </p>
                
                <div>
                  <div className="text-white font-medium">
                    {testimonial.name}
                  </div>
                  <div className="text-zinc-400 text-sm">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Simple, Transparent Pricing
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`bg-zinc-900 rounded-lg p-8 ${
                  plan.highlighted ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full text-center mb-4">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                
                <div className="text-3xl font-bold text-white mb-4">
                  {plan.price}
                  <span className="text-lg text-zinc-400">/month</span>
                </div>
                
                <p className="text-zinc-400 mb-6">
                  {plan.users}
                </p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start text-zinc-300">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full rounded-full ${
                    plan.highlighted ? 'bg-blue-500 hover:bg-blue-600' : ''
                  }`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-4xl text-center">
          <Zap className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Sales Process?
          </h2>
          <p className="text-zinc-400 mb-8">
            Join thousands of businesses using KiTS Hub CRM to close more deals and build better customer relationships.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
            />
            <Button className="rounded-full">
              Start Free Trial
            </Button>
          </div>
          
          <p className="text-zinc-400 text-sm mt-4">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
