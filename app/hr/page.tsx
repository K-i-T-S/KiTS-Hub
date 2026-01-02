import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Award, TrendingUp, CheckCircle, Star, Zap } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Employee Management",
    description: "Centralized employee database with comprehensive profile management",
    benefits: ["Employee records", "Document management", "Organizational chart", "Employee self-service"]
  },
  {
    icon: Calendar,
    title: "Time & Attendance",
    description: "Track working hours, manage schedules, and monitor attendance",
    benefits: ["Time tracking", "Shift scheduling", "Leave management", "Overtime calculation"]
  },
  {
    icon: Award,
    title: "Performance Management",
    description: "Set goals, conduct reviews, and track employee development",
    benefits: ["Goal setting", "Performance reviews", "360-degree feedback", "Development plans"]
  },
  {
    icon: TrendingUp,
    title: "Payroll Management",
    description: "Automated payroll processing with tax calculations and compliance",
    benefits: ["Automated payroll", "Tax calculations", "Direct deposit", "Pay stubs"]
  }
]

const modules = [
  {
    name: "Recruitment",
    description: "Streamline hiring from job posting to onboarding",
    icon: Users,
    features: ["Job posting", "Applicant tracking", "Interview scheduling", "Offer management"]
  },
  {
    name: "Onboarding",
    description: "Smooth onboarding experience for new hires",
    icon: Calendar,
    features: ["Welcome workflows", "Document collection", "Training schedules", "Buddy programs"]
  },
  {
    name: "Benefits",
    description: "Manage employee benefits and enrollment",
    icon: Award,
    features: ["Health insurance", "Retirement plans", "Flexible spending", "Time off policies"]
  },
  {
    name: "Analytics",
    description: "HR metrics and workforce insights",
    icon: TrendingUp,
    features: ["Turnover rates", "Headcount reports", "Compensation analysis", "Diversity metrics"]
  }
]

const integrations = [
  { name: "ADP", logo: "/integrations/adp.png", description: "Payroll services" },
  { name: "QuickBooks", logo: "/integrations/quickbooks.png", description: "Accounting integration" },
  { name: "Slack", logo: "/integrations/slack.png", description: "Team communication" },
  { name: "Zoom", logo: "/integrations/zoom.png", description: "Video interviews" },
  { name: "LinkedIn", logo: "/integrations/linkedin.png", description: "Recruiting" },
  { name: "Indeed", logo: "/integrations/indeed.png", description: "Job posting" }
]

const testimonials = [
  {
    name: "Jennifer Roberts",
    role: "HR Director",
    company: "Tech Innovations",
    content: "KiTS Hub HR has transformed our HR processes. We've reduced administrative time by 60% and improved employee satisfaction.",
    rating: 5
  },
  {
    name: "Michael Chang",
    role: "Operations Manager",
    company: "Growth Solutions",
    content: "The payroll module alone has saved us countless hours. Everything is automated and compliant.",
    rating: 5
  },
  {
    name: "Sarah Williams",
    role: "CEO",
    company: "Creative Agency",
    content: "Best HR platform we've used. Intuitive, comprehensive, and the support team is amazing.",
    rating: 5
  }
]

const pricing = [
  {
    name: "Starter",
    price: "$39",
    employees: "Up to 10 employees",
    features: [
      "Employee database",
      "Time tracking",
      "Basic reporting",
      "Document storage",
      "Mobile app"
    ],
    highlighted: false
  },
  {
    name: "Professional",
    price: "$99",
    employees: "Up to 50 employees",
    features: [
      "Everything in Starter",
      "Payroll processing",
      "Performance management",
      "Benefits administration",
      "Advanced analytics",
      "API access"
    ],
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    employees: "Unlimited employees",
    features: [
      "Everything in Professional",
      "Custom workflows",
      "Dedicated support",
      "Advanced security",
      "White-label options",
      "SLA guarantee"
    ],
    highlighted: false
  }
]

export default function HR() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <Users className="w-16 h-16 text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            HR Management Software
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Comprehensive HR solution to manage your entire employee lifecycle. From recruitment to retirement, streamline all HR processes in one platform.
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
            Complete HR Management
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-zinc-900 rounded-lg p-6">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
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

      {/* Modules */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            HR Modules
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => (
              <div key={module.name} className="bg-zinc-800 rounded-lg p-6">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {module.name}
                </h3>
                
                <p className="text-zinc-400 text-sm mb-4">
                  {module.description}
                </p>
                
                <ul className="space-y-1">
                  {module.features.map((feature) => (
                    <li key={feature} className="text-zinc-400 text-xs">
                      • {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            HR Excellence by the Numbers
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">60%</div>
              <div className="text-zinc-400">Reduction in Admin Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">85%</div>
              <div className="text-zinc-400">Employee Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">40%</div>
              <div className="text-zinc-400">Faster Onboarding</div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            HR Ecosystem Integrations
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <div key={integration.name} className="bg-zinc-800 rounded-lg p-6 flex items-center">
                <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center mr-4">
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
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Trusted by HR Teams
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-zinc-900 rounded-lg p-6">
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
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Pricing That Grows With You
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`bg-zinc-800 rounded-lg p-8 ${
                  plan.highlighted ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-purple-500 text-white text-sm px-3 py-1 rounded-full text-center mb-4">
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
                  {plan.employees}
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
                    plan.highlighted ? 'bg-purple-500 hover:bg-purple-600' : ''
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
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <Zap className="w-16 h-16 text-purple-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your HR?
          </h2>
          <p className="text-zinc-400 mb-8">
            Join thousands of HR professionals using KiTS Hub to streamline processes and improve employee experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500"
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
