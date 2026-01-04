"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Database, Users, ShoppingCart, FileText, Settings, BarChart } from "lucide-react"
import { AndMuchMoreBanner } from "@/components/sections/and-much-more-banner"

const features = [
  {
    icon: Database,
    title: "CRM Management",
    description: "Manage customer relationships with our comprehensive CRM system. Track interactions, manage leads, and nurture relationships.",
    link: "#crm"
  },
  {
    icon: ShoppingCart,
    title: "Point of Sale",
    description: "Complete POS solution for retail and service businesses. Process payments, manage inventory, and track sales in real-time.",
    link: "#pos"
  },
  {
    icon: Users,
    title: "HR Management",
    description: "Streamline HR processes from hiring to payroll. Manage employee data, time tracking, and performance reviews.",
    link: "#hr"
  },
  {
    icon: FileText,
    title: "Accounting",
    description: "Professional accounting tools for invoicing, expense tracking, and financial reporting. Stay compliant and organized.",
    link: "#accounting"
  },
  {
    icon: BarChart,
    title: "Analytics",
    description: "Powerful analytics and reporting tools. Get insights into your business performance with customizable dashboards.",
    link: "#analytics"
  },
  {
    icon: Settings,
    title: "Automation",
    description: "Automate repetitive tasks and workflows. Save time and reduce errors with intelligent automation tools.",
    link: "#automation"
  }
]

export function FeaturesGridSection() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* And Much More Banner - Moved to top */}
        <AndMuchMoreBanner />

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card"
            >
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#f3e8ff] to-[#e9d5ff] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                  <feature.icon className="w-6 h-6 text-[#6b21a8]" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground mb-4">
                  {feature.description}
                </CardDescription>
                <Button variant="ghost" size="sm" className="group-hover:bg-gradient-to-r group-hover:from-[#f3e8ff] group-hover:to-[#e9d5ff] text-current group-hover:text-[#581c87] hover:text-[#581c87] transition-all duration-300 group-hover:shadow-md group-hover:shadow-purple-500/20" asChild>
                  <a href={feature.link} className="flex items-center gap-2">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform group-hover:text-[#581c87]" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
