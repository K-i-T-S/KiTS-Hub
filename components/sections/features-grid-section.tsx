"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Database, Users, ShoppingCart, FileText, Settings, BarChart } from "lucide-react"

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
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Everything you need to <span className="bg-gradient-to-r from-[#6b21a8] via-[#9333ea] to-[#a855f7] bg-clip-text text-transparent">grow your business</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            All the tools you need to run your business efficiently, integrated seamlessly in one platform.
          </p>
        </div>

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
                <Button variant="ghost" size="sm" className="group-hover:bg-gradient-to-r group-hover:from-[#f3e8ff] group-hover:to-[#e9d5ff] group-hover:text-[#6b21a8] transition-all duration-300 group-hover:shadow-md group-hover:shadow-purple-500/20" asChild>
                  <a href={feature.link} className="flex items-center gap-2">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
