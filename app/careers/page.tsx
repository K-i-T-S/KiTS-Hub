import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { MapPin, Briefcase, DollarSign, Users, Heart, Target, Zap } from "lucide-react"

const openPositions = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    salary: "$120k - $160k",
    description: "We're looking for an experienced frontend developer to help build our next-generation business management platform.",
    requirements: ["5+ years React/Next.js experience", "TypeScript expertise", "UI/UX design sense", "Team leadership experience"]
  },
  {
    id: 2,
    title: "Product Manager",
    department: "Product",
    location: "New York, NY",
    type: "Full-time",
    salary: "$130k - $170k",
    description: "Lead product strategy and development for our CRM and business management tools.",
    requirements: ["3+ years PM experience", "SaaS background", "Data-driven approach", "Excellent communication"]
  },
  {
    id: 3,
    title: "Sales Development Representative",
    department: "Sales",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$70k - $90k + Commission",
    description: "Help us grow our customer base by identifying and qualifying new business opportunities.",
    requirements: ["1+ years sales experience", "CRM familiarity", "Excellent communication", "Goal-oriented"]
  },
  {
    id: 4,
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Remote",
    type: "Full-time",
    salary: "$80k - $100k",
    description: "Ensure our customers get maximum value from KiTS Hub and help them achieve their business goals.",
    requirements: ["2+ years CSM experience", "SaaS background", "Problem-solving skills", "Customer empathy"]
  },
  {
    id: 5,
    title: "Backend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    salary: "$110k - $150k",
    description: "Build and maintain scalable backend systems for our business management platform.",
    requirements: ["4+ years backend experience", "Node.js/Python expertise", "Database design", "API development"]
  },
  {
    id: 6,
    title: "Marketing Manager",
    department: "Marketing",
    location: "New York, NY",
    type: "Full-time",
    salary: "$90k - $120k",
    description: "Drive our marketing strategy and help us reach more businesses with our platform.",
    requirements: ["3+ years marketing experience", "B2B SaaS background", "Content strategy", "Analytics skills"]
  }
]

const benefits = [
  {
    icon: Heart,
    title: "Health & Wellness",
    description: "Comprehensive health, dental, and vision insurance for you and your family"
  },
  {
    icon: Target,
    title: "Career Growth",
    description: "Professional development budget and clear career advancement paths"
  },
  {
    icon: Zap,
    title: "Work Flexibility",
    description: "Remote-first culture with flexible hours and unlimited PTO"
  },
  {
    icon: Users,
    title: "Team Culture",
    description: "Collaborative environment with regular team events and activities"
  }
]

const values = [
  {
    title: "Customer First",
    description: "We exist to help our customers succeed. Every decision we make starts with the customer in mind."
  },
  {
    title: "Own It",
    description: "We take responsibility for our work and outcomes. No excuses, just results."
  },
  {
    title: "Learn & Grow",
    description: "We're curious, open-minded, and always looking for ways to improve ourselves and our product."
  },
  {
    title: "Better Together",
    description: "We collaborate, support each other, and celebrate our collective wins."
  }
]

export default function Careers() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join Our Team
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Help us build the future of business management. We&apos;re looking for talented people who are passionate about solving real-world problems.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="rounded-full">
              View Open Positions
            </Button>
            <Button variant="outline" className="rounded-full">
              Learn About Our Culture
            </Button>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Our Values
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <h3 className="text-xl font-semibold text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-zinc-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Benefits & Perks
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-zinc-900 rounded-lg p-6 text-center">
                <benefit.icon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-zinc-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8">
            Open Positions
          </h2>
          
          <div className="space-y-6">
            {openPositions.map((position) => (
              <article
                key={position.id}
                className="bg-zinc-900 rounded-lg p-6 hover:bg-zinc-800 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {position.title}
                    </h3>
                    
                    <p className="text-zinc-400 mb-4">
                      {position.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                        {position.department}
                      </span>
                      <span className="bg-green-600/20 text-green-400 text-xs px-2 py-1 rounded-full">
                        {position.type}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Requirements:</h4>
                      <ul className="space-y-1">
                        {position.requirements.map((req, index) => (
                          <li key={index} className="text-zinc-400 text-sm flex items-start">
                            <span className="text-blue-400 mr-2">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="lg:w-64">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center text-zinc-400">
                        <MapPin className="w-4 h-4 mr-2" />
                        {position.location}
                      </div>
                      <div className="flex items-center text-zinc-400">
                        <Briefcase className="w-4 h-4 mr-2" />
                        {position.type}
                      </div>
                      <div className="flex items-center text-zinc-400">
                        <DollarSign className="w-4 h-4 mr-2" />
                        {position.salary}
                      </div>
                    </div>
                    
                    <Button className="w-full mt-6 rounded-full">
                      Apply Now
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* No Current Positions */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Don&apos;t See Your Dream Job?
          </h2>
          <p className="text-zinc-400 mb-8">
            We&apos;re always looking for talented people. Send us your resume and we&apos;ll keep you in mind for future openings.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
            />
            <Button variant="outline" className="rounded-full">
              Send Resume
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
