import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, ArrowRight } from "lucide-react"

const pricingPlans = [
  {
    name: "Free",
    description: "Perfect for small teams getting started",
    price: "$0",
    billing: "/month",
    features: [
      "Up to 3 users",
      "Basic CRM features",
      "1GB storage",
      "Email support",
      "Mobile app access",
      "Basic reporting",
      "Data export",
      "Community support"
    ],
    notIncluded: [
      "Advanced analytics",
      "Custom integrations",
      "API access",
      "Priority support",
      "Advanced security",
      "Custom branding"
    ],
    cta: "Get Started",
    highlighted: false
  },
  {
    name: "Professional",
    description: "For growing businesses that need more power",
    price: "$49",
    billing: "/user/month",
    features: [
      "Up to 50 users",
      "Advanced CRM & POS",
      "100GB storage",
      "Priority support",
      "Advanced analytics",
      "Custom integrations",
      "API access",
      "Advanced security",
      "Custom branding",
      "Automated workflows",
      "Advanced reporting",
      "Data import/export"
    ],
    notIncluded: [
      "Unlimited storage",
      "Dedicated account manager",
      "Custom development",
      "SLA guarantee",
      "On-premise deployment"
    ],
    cta: "Start Free Trial",
    highlighted: true
  },
  {
    name: "Enterprise",
    description: "For large organizations with complex needs",
    price: "Custom",
    billing: "",
    features: [
      "Unlimited users",
      "All features included",
      "Unlimited storage",
      "Dedicated support",
      "Custom development",
      "SLA guarantee",
      "Advanced security",
      "On-premise option",
      "Dedicated account manager",
      "Custom training",
      "Advanced compliance",
      "White-label options"
    ],
    notIncluded: [],
    cta: "Contact Sales",
    highlighted: false
  }
]

const featureCategories = [
  {
    name: "Core Features",
    features: [
      "CRM Management",
      "Point of Sale",
      "HR Management", 
      "Accounting",
      "Inventory Tracking",
      "Project Management"
    ]
  },
  {
    name: "Support & Service",
    features: [
      "Email Support",
      "Priority Support",
      "Dedicated Support",
      "Phone Support",
      "Training Resources",
      "Community Access"
    ]
  },
  {
    name: "Security & Compliance",
    features: [
      "Basic Security",
      "Advanced Security",
      "Enterprise Security",
      "SOC 2 Compliance",
      "GDPR Compliance",
      "Custom Security Policies"
    ]
  },
  {
    name: "Integrations & API",
    features: [
      "Basic Integrations",
      "Custom Integrations",
      "API Access",
      "Webhooks",
      "Custom Development",
      "Third-party Marketplace"
    ]
  }
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      <main className="py-20">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Choose the perfect plan for your business. No hidden fees, no surprises.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="lg">
                Monthly
              </Button>
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                Annual (Save 20%)
              </Button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${
                  plan.highlighted 
                    ? 'border-orange-500 shadow-lg scale-105' 
                    : 'border-border/50'
                } bg-card`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.billing}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature, featureIndex) => (
                      <li key={`not-${featureIndex}`} className="flex items-start gap-3 opacity-50">
                        <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${
                      plan.highlighted 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : ''
                    }`}
                    variant={plan.highlighted ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                    {plan.cta === "Contact Sales" && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature Comparison Table */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              Compare all features
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 font-semibold">Free</th>
                    <th className="text-center p-4 font-semibold">Professional</th>
                    <th className="text-center p-4 font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {featureCategories.map((category, categoryIndex) => (
                    <tr key={categoryIndex} className="border-b border-border/50">
                      <td className="p-4 font-medium bg-muted/50" colSpan={4}>
                        {category.name}
                      </td>
                    </tr>
                  ))}
                  {featureCategories[0].features.map((feature, featureIndex) => (
                    <tr key={featureIndex} className="border-b border-border/20">
                      <td className="p-4">{feature}</td>
                      <td className="text-center p-4">
                        {featureIndex < 2 ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-500 mx-auto opacity-30" />
                        )}
                      </td>
                      <td className="text-center p-4">
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: "Can I change plans anytime?",
                  a: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
                },
                {
                  q: "What happens if I exceed my plan limits?",
                  a: "We'll notify you when you're approaching your limits. You can upgrade to a higher plan or purchase add-ons for additional resources."
                },
                {
                  q: "Do you offer discounts for annual billing?",
                  a: "Yes, annual billing saves you 20% compared to monthly billing. This discount is applied automatically when you choose annual billing."
                },
                {
                  q: "Is my data secure?",
                  a: "Absolutely. We use enterprise-grade security measures including encryption, regular security audits, and compliance with industry standards."
                },
                {
                  q: "Can I cancel my subscription?",
                  a: "Yes, you can cancel your subscription at any time. Your service will continue until the end of your current billing period."
                }
              ].map((faq, index) => (
                <Card key={index} className="bg-card border-border/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{faq.q}</h3>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-20 p-8 bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Need a custom solution?
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Contact our sales team to discuss your specific requirements and get a tailored solution for your business.
            </p>
            <Button size="lg" className="bg-white text-orange-600 hover:bg-white/90">
              Contact Sales
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
