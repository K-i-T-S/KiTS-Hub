"use client"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Brain, TrendingUp, BarChart3, PieChart, CheckCircle, Star, Zap, Target } from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Real-Time Dashboards",
    description: "Interactive dashboards with live data updates and customizable widgets",
    benefits: ["Real-time data", "Custom widgets", "Mobile responsive", "Role-based views"]
  },
  {
    icon: TrendingUp,
    title: "Business Intelligence",
    description: "Advanced analytics with predictive insights and trend analysis",
    benefits: ["Predictive analytics", "Trend detection", "Forecasting", "KPI tracking"]
  },
  {
    icon: PieChart,
    title: "Custom Reports",
    description: "Build custom reports with drag-and-drop report builder",
    benefits: ["Drag-and-drop builder", "Scheduled reports", "Export options", "Report templates"]
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Machine learning algorithms that uncover hidden patterns and opportunities",
    benefits: ["Pattern recognition", "Anomaly detection", "Recommendations", "Automated insights"]
  }
]

const analyticsTypes = [
  {
    name: "Sales Analytics",
    description: "Track sales performance, conversion rates, and revenue trends",
    icon: TrendingUp,
    metrics: ["Revenue analysis", "Sales funnel", "Conversion tracking", "Team performance"]
  },
  {
    name: "Customer Analytics",
    description: "Understand customer behavior and improve retention",
    icon: Target,
    metrics: ["Customer segments", "Lifetime value", "Churn analysis", "Satisfaction scores"]
  },
  {
    name: "Financial Analytics",
    description: "Monitor financial health and optimize cash flow",
    icon: BarChart3,
    metrics: ["Cash flow", "Profit margins", "Expense analysis", "Budget tracking"]
  },
  {
    name: "Operational Analytics",
    description: "Optimize business processes and resource allocation",
    icon: PieChart,
    metrics: ["Process efficiency", "Resource utilization", "Productivity metrics", "Quality indicators"]
  }
]

const integrations = [
  { name: "Google Analytics", logo: "/integrations/google.png", description: "Web analytics" },
  { name: "Salesforce", logo: "/integrations/salesforce.png", description: "CRM data" },
  { name: "Tableau", logo: "/integrations/tableau.png", description: "Data visualization" },
  { name: "Power BI", logo: "/integrations/powerbi.png", description: "Business intelligence" },
  { name: "Mixpanel", logo: "/integrations/mixpanel.png", description: "Product analytics" },
  { name: "Segment", logo: "/integrations/segment.png", description: "Customer data platform" }
]

const testimonials = [
  {
    name: "Lisa Johnson",
    role: "Data Analyst",
    company: "Tech Innovations",
    content: "KiTS Hub Analytics has transformed how we make decisions. The AI insights alone have increased our ROI by 35%.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Business Intelligence Manager",
    company: "Growth Solutions",
    content: "The real-time dashboards give us instant visibility into our business performance. It's like having a crystal ball.",
    rating: 5
  },
  {
    name: "Sarah Williams",
    role: "CEO",
    company: "Digital Agency",
    content: "Best analytics platform we've ever used. Intuitive, powerful, and the support team is exceptional.",
    rating: 5
  }
]

const pricing = [
  {
    name: "Starter",
    price: "$59",
    users: "Up to 5 users",
    features: [
      "Basic dashboards",
      "Standard reports",
      "Data connectors",
      "Email support",
      "Mobile access"
    ],
    highlighted: false
  },
  {
    name: "Professional",
    price: "$149",
    users: "Up to 20 users",
    features: [
      "Everything in Starter",
      "Advanced analytics",
      "AI insights",
      "Custom reports",
      "API access",
      "Priority support"
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
      "Advanced security",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee"
    ],
    highlighted: false
  }
]

export default function Analytics() {
  const router = useRouter()

  const handleStartTrial = () => {
    router.push('/signup')
  }

  const handleScheduleDemo = () => {
    router.push('/demo')
  }

  const handleViewIntegrations = () => {
    router.push('/integrations')
  }

  const handleContactSales = () => {
    router.push('/contact')
  }
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <Brain className="w-16 h-16 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Business Analytics
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Transform your data into actionable insights. Advanced analytics platform with AI-powered insights and real-time dashboards.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="rounded-full" onClick={handleStartTrial}>
              Start Free Trial
            </Button>
            <Button variant="outline" className="rounded-full" onClick={handleScheduleDemo}>
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Advanced Analytics Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-zinc-900 rounded-lg p-6">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
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

      {/* Analytics Types */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Analytics Solutions
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsTypes.map((type) => (
              <div key={type.name} className="bg-zinc-800 rounded-lg p-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <type.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {type.name}
                </h3>
                
                <p className="text-zinc-400 text-sm mb-4">
                  {type.description}
                </p>
                
                <ul className="space-y-1">
                  {type.metrics.map((metric) => (
                    <li key={metric} className="text-zinc-400 text-xs">
                      • {metric}
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
            Data-Driven Results
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-400 mb-2">35%</div>
              <div className="text-zinc-400">Increase in ROI</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">80%</div>
              <div className="text-zinc-400">Faster Decision Making</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">95%</div>
              <div className="text-zinc-400">Data Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Data Ecosystem
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
            <Button variant="outline" className="rounded-full" onClick={handleViewIntegrations}>
              View All Integrations
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Trusted by Data Teams
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
            Analytics Pricing
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`bg-zinc-800 rounded-lg p-8 ${
                  plan.highlighted ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-indigo-500 text-white text-sm px-3 py-1 rounded-full text-center mb-4">
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
                    plan.highlighted ? 'bg-indigo-500 hover:bg-indigo-600' : ''
                  }`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                  onClick={plan.name === 'Enterprise' ? handleContactSales : handleStartTrial}
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
          <Zap className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Unlock Your Data&apos;s Potential?
          </h2>
          <p className="text-zinc-400 mb-8">
            Join thousands of businesses using KiTS Hub Analytics to make smarter, data-driven decisions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
            />
            <Button className="rounded-full" onClick={handleStartTrial}>
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
