import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Users, Target, Lightbulb, Award } from "lucide-react"

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "CEO & Founder",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
    bio: "Former VP of Product at Salesforce, passionate about democratizing business management tools."
  },
  {
    name: "Michael Chen",
    role: "CTO",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop",
    bio: "Ex-Google engineer with expertise in scalable systems and enterprise software architecture."
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Design",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200",
    bio: "Award-winning designer focused on creating intuitive user experiences for complex business tools."
  },
  {
    name: "David Kim",
    role: "VP of Sales",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop",
    bio: "15+ years in SaaS sales, helping businesses find the right solutions for their growth."
  },
  {
    name: "Lisa Thompson",
    role: "Head of Customer Success",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?q=80&w=200&h=200&auto=format&fit=crop",
    bio: "Dedicated to ensuring customers get maximum value from our platform and achieve their goals."
  },
  {
    name: "James Wilson",
    role: "Lead Engineer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop",
    bio: "Full-stack developer with a passion for building robust, scalable business applications."
  }
]

const values = [
  {
    icon: Target,
    title: "Customer-Centric",
    description: "We put our customers at the heart of everything we do, building solutions that solve real business problems."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We constantly push boundaries and explore new ways to make business management simpler and more effective."
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "We believe in the power of teamwork, both within our company and with our customers and partners."
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We strive for excellence in every aspect of our business, from product quality to customer service."
  }
]

const timeline = [
  {
    year: "2020",
    title: "Foundation",
    description: "KiTS Hub was founded with a mission to democratize business management tools for small and medium businesses."
  },
  {
    year: "2021",
    title: "First Launch",
    description: "Launched our MVP with core CRM and POS features, serving our first 100 customers."
  },
  {
    year: "2022",
    title: "Growth Phase",
    description: "Expanded to 5,000+ customers and added HR and accounting modules. Raised Series A funding."
  },
  {
    year: "2023",
    title: "Enterprise Ready",
    description: "Introduced enterprise features, API access, and custom integrations. Reached 50,000 customers."
  },
  {
    year: "2024",
    title: "AI Integration",
    description: "Launched AI-powered features and automation tools. Expanded to international markets."
  },
  {
    year: "2025",
    title: "Market Leader",
    description: "Serving 100,000+ businesses worldwide with a comprehensive business management platform."
  }
]

const pressMentions = [
  {
    logo: "TechCrunch",
    title: "KiTS Hub Raises $50M Series B to Democratize Business Management",
    date: "March 2024"
  },
  {
    logo: "Forbes",
    title: "How KiTS Hub is Transforming Small Business Operations",
    date: "January 2024"
  },
  {
    logo: "Business Insider",
    title: "The All-in-One Platform That's Competing with Salesforce",
    date: "November 2023"
  },
  {
    logo: "VentureBeat",
    title: "KiTS Hub's AI Features Are Changing the Game for SMBs",
    date: "September 2023"
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Empowering businesses to <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">thrive</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                We&apos;re on a mission to provide every business with the tools they need to succeed, 
                regardless of size or budget. From startups to enterprises, KiTS Hub is the trusted 
                partner for business growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                  Join Our Team
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" size="lg">
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-zinc-100">100K+</div>
                <div className="text-sm text-zinc-400">Active Customers</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-zinc-100">150+</div>
                <div className="text-sm text-zinc-400">Countries</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-zinc-100">99.9%</div>
                <div className="text-sm text-zinc-400">Uptime</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-zinc-100">500+</div>
                <div className="text-sm text-zinc-400">Team Members</div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Our Mission & Vision
              </h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-orange-500">Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To democratize business management by providing powerful, affordable, 
                    and easy-to-use tools that enable every business to compete and thrive 
                    in the digital economy.
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-orange-500">Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    A world where every business, regardless of size or resources, has access 
                    to the same powerful tools and insights that drive enterprise success.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Our Values
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <Card key={index} className="bg-card border-border/50 text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-6 h-6 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Our Journey
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        {item.year.slice(-2)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Meet Our Team
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {teamMembers.map((member, index) => (
                <Card key={index} className="bg-card border-border/50">
                  <CardContent className="p-6 text-center">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <p className="text-orange-500 mb-3">{member.role}</p>
                    <p className="text-muted-foreground text-sm">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Press Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              In the Press
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {pressMentions.map((mention, index) => (
                <Card key={index} className="bg-card border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center text-sm font-bold text-zinc-400">
                        {mention.logo.slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{mention.title}</h3>
                        <p className="text-sm text-muted-foreground">{mention.logo} • {mention.date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Careers CTA */}
        <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-500">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Join Our Team
              </h2>
              <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                We&apos;re always looking for talented individuals who share our passion for 
                helping businesses succeed. Check out our open positions and join us on our mission.
              </p>
              <Button size="lg" className="bg-white text-orange-600 hover:bg-white/90">
                View Open Positions
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
