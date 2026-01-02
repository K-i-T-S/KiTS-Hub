"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

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
      "Mobile app access"
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
      "API access"
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
      "On-premise option"
    ],
    cta: "Contact Sales",
    highlighted: false
  }
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your business. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${
                plan.highlighted 
                  ? 'border-gradient-to-br from-[#9333ea] to-[#7c3aed] shadow-xl shadow-purple-500/25 scale-105 bg-gradient-to-br from-[#faf5ff]/50 to-[#f3e8ff]/50' 
                  : 'border-border/50'
              } bg-card`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#9333ea] to-[#7c3aed] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-purple-500/30 whitespace-nowrap">
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
                </ul>
                
                {plan.cta === "Contact Sales" ? (
                  <Link href="/contact" passHref>
                    <Button 
                      className="w-full"
                      variant="outline"
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                ) : (
                  <Link href="/signup" passHref>
                    <Button 
                      className={`w-full ${
                        plan.highlighted 
                          ? 'bg-gradient-to-r from-[#9333ea] via-[#a855f7] to-[#7c3aed] hover:from-[#7c3aed] hover:via-[#9333ea] hover:to-[#6b21a8] text-white shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105' 
                          : ''
                      }`}
                      variant={plan.highlighted ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            All plans include 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  )
}
