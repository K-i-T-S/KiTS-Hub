import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calculator, FileText, TrendingUp, DollarSign, CheckCircle, ArrowRight, Star, Zap, Receipt } from "lucide-react"

const features = [
  {
    icon: Calculator,
    title: "General Ledger",
    description: "Comprehensive double-entry bookkeeping with automated reconciliation",
    benefits: ["Chart of accounts", "Journal entries", "Trial balance", "Financial statements"]
  },
  {
    icon: FileText,
    title: "Invoicing & Billing",
    description: "Create and manage invoices with automated payment reminders",
    benefits: ["Custom invoices", "Recurring billing", "Payment reminders", "Online payments"]
  },
  {
    icon: TrendingUp,
    title: "Financial Reporting",
    description: "Generate detailed financial reports and business insights",
    benefits: ["P&L statements", "Balance sheets", "Cash flow", "Custom reports"]
  },
  {
    icon: DollarSign,
    title: "Expense Management",
    description: "Track and categorize expenses with approval workflows",
    benefits: ["Expense tracking", "Receipt scanning", "Approval workflows", "Reimbursement"]
  }
]

const modules = [
  {
    name: "Accounts Payable",
    description: "Manage vendor bills and payments efficiently",
    icon: FileText,
    features: ["Bill management", "Payment scheduling", "Vendor tracking", "Purchase orders"]
  },
  {
    name: "Accounts Receivable",
    description: "Track customer invoices and collections",
    icon: DollarSign,
    features: ["Invoice tracking", "Payment processing", "Collections", "Credit management"]
  },
  {
    name: "Bank Reconciliation",
    description: "Automated bank statement reconciliation",
    icon: Calculator,
    features: ["Auto-import", "Matching rules", "Discrepancy detection", "Reconciliation reports"]
  },
  {
    name: "Tax Management",
    description: "Automated tax calculations and compliance",
    icon: Receipt,
    features: ["Sales tax", "VAT/GST", "Tax reports", "Filing assistance"]
  }
]

const integrations = [
  { name: "QuickBooks", logo: "/integrations/quickbooks.png", description: "Accounting software" },
  { name: "Xero", logo: "/integrations/xero.png", description: "Cloud accounting" },
  { name: "Stripe", logo: "/integrations/stripe.png", description: "Payment processing" },
  { name: "PayPal", logo: "/integrations/paypal.png", description: "Online payments" },
  { name: "Expensify", logo: "/integrations/expensify.png", description: "Expense management" },
  { name: "Bill.com", logo: "/integrations/bill.png", description: "Bill payment" }
]

const testimonials = [
  {
    name: "Robert Chen",
    role: "CFO",
    company: "Finance Solutions Inc.",
    content: "KiTS Hub Accounting has streamlined our entire financial operations. Month-end closing is now 50% faster.",
    rating: 5
  },
  {
    name: "Amanda Foster",
    role: "Accounting Manager",
    company: "Growth Enterprises",
    content: "The automated bank reconciliation alone saves us 20 hours per month. Best accounting decision we've made.",
    rating: 5
  },
  {
    name: "David Martinez",
    role: "Business Owner",
    company: "Retail Ventures",
    content: "Finally, an accounting system that actually understands small business needs. Simple, powerful, and affordable.",
    rating: 5
  }
]

const pricing = [
  {
    name: "Basic",
    price: "$49",
    transactions: "Up to 100 transactions/month",
    features: [
      "General ledger",
      "Basic invoicing",
      "Expense tracking",
      "Standard reports",
      "Mobile app"
    ],
    highlighted: false
  },
  {
    name: "Professional",
    price: "$99",
    transactions: "Up to 500 transactions/month",
    features: [
      "Everything in Basic",
      "Advanced reporting",
      "Multi-currency",
      "Bank reconciliation",
      "Tax management",
      "API access"
    ],
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    transactions: "Unlimited transactions",
    features: [
      "Everything in Professional",
      "Custom workflows",
      "Advanced security",
      "Dedicated support",
      "White-label options",
      "SLA guarantee"
    ],
    highlighted: false
  }
]

export default function Accounting() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <Calculator className="w-16 h-16 text-red-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Accounting Software
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Professional accounting solution for businesses of all sizes. Automate bookkeeping, streamline financial reporting, and ensure compliance.
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
            Complete Accounting Solution
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-zinc-900 rounded-lg p-6">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
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
            Accounting Modules
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => (
              <div key={module.name} className="bg-zinc-800 rounded-lg p-6">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
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
            Accounting Excellence
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">50%</div>
              <div className="text-zinc-400">Faster Month-End Closing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">99.9%</div>
              <div className="text-zinc-400">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">40%</div>
              <div className="text-zinc-400">Cost Reduction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Financial Ecosystem
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
            Trusted by Finance Teams
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
            Transparent Pricing
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`bg-zinc-800 rounded-lg p-8 ${
                  plan.highlighted ? 'ring-2 ring-red-500' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-red-500 text-white text-sm px-3 py-1 rounded-full text-center mb-4">
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
                  {plan.transactions}
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
                    plan.highlighted ? 'bg-red-500 hover:bg-red-600' : ''
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
          <Zap className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Simplify Your Accounting?
          </h2>
          <p className="text-zinc-400 mb-8">
            Join thousands of businesses using KiTS Hub Accounting to streamline financial operations and ensure compliance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-red-500"
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
