import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, ExternalLink, Download, ArrowRight } from "lucide-react"

const pressReleases = [
  {
    id: 1,
    title: "KiTS Hub Raises $25M Series B to Transform Business Management",
    date: "2024-12-01",
    category: "Funding",
    excerpt: "Leading business management platform secures major funding round to accelerate product development and global expansion.",
    image: "/press/series-b.jpg",
    featured: true
  },
  {
    id: 2,
    title: "KiTS Hub Launches AI-Powered Analytics Suite",
    date: "2024-11-15",
    category: "Product",
    excerpt: "New artificial intelligence capabilities help businesses make data-driven decisions with predictive analytics and automated insights.",
    image: "/press/ai-analytics.jpg",
    featured: false
  },
  {
    id: 3,
    title: "Company Reaches 10,000 Active Business Customers",
    date: "2024-10-20",
    category: "Milestone",
    excerpt: "Rapid growth continues as more businesses choose KiTS Hub for their integrated business management needs.",
    image: "/press/10k-customers.jpg",
    featured: false
  },
  {
    id: 4,
    title: "KiTS Hub Named Best Business Management Platform 2024",
    date: "2024-09-05",
    category: "Award",
    excerpt: "Industry recognition highlights platform's innovation and customer satisfaction in the competitive business software market.",
    image: "/press/award-2024.jpg",
    featured: false
  },
  {
    id: 5,
    title: "Partnership with Major Payment Processors Announced",
    date: "2024-08-12",
    category: "Partnership",
    excerpt: "Strategic integrations with leading payment providers streamline financial operations for customers.",
    image: "/press/payment-partnership.jpg",
    featured: false
  },
  {
    id: 6,
    title: "Mobile App Launch Extends Platform Capabilities",
    date: "2024-07-01",
    category: "Product",
    excerpt: "New mobile applications bring full business management functionality to smartphones and tablets.",
    image: "/press/mobile-app.jpg",
    featured: false
  }
]

const mediaCoverage = [
  {
    publication: "TechCrunch",
    title: "How KiTS Hub is Revolutionizing Small Business Management",
    date: "2024-11-20",
    url: "#",
    excerpt: "A deep dive into the platform that's helping thousands of businesses streamline their operations."
  },
  {
    publication: "Forbes",
    title: "The Future of Integrated Business Software",
    date: "2024-10-15",
    url: "#",
    excerpt: "Industry experts weigh in on the trend toward all-in-one business management solutions."
  },
  {
    publication: "Business Insider",
    title: "Why Startups Are Choosing KiTS Hub Over Traditional Software",
    date: "2024-09-28",
    url: "#",
    excerpt: "Young companies explain why they prefer integrated platforms over multiple specialized tools."
  },
  {
    publication: "VentureBeat",
    title: "AI in Business Management: KiTS Hub Leads the Way",
    date: "2024-08-10",
    url: "#",
    excerpt: "How artificial intelligence is transforming everyday business operations through smart automation."
  }
]

const companyStats = [
  { value: "10,000+", label: "Active Customers" },
  { value: "50+", label: "Countries Served" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.8/5", label: "Customer Rating" }
]

const downloadAssets = [
  {
    title: "Press Kit",
    description: "Complete press kit with logos, images, and company information",
    type: "ZIP",
    size: "15MB"
  },
  {
    title: "Company Overview",
    description: "One-page summary of KiTS Hub and our mission",
    type: "PDF",
    size: "2MB"
  },
  {
    title: "Executive Bios",
    description: "Biographies and headshots of leadership team",
    type: "PDF",
    size: "5MB"
  },
  {
    title: "Product Screenshots",
    description: "High-resolution screenshots of the platform",
    type: "ZIP",
    size: "25MB"
  }
]

export default function Press() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Press & Media
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            The latest news, updates, and resources for journalists and media professionals covering KiTS Hub.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="rounded-full">
              Download Press Kit
            </Button>
            <Button variant="outline" className="rounded-full">
              Contact PR Team
            </Button>
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {companyStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-zinc-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Press Release */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8">Latest News</h2>
          
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {pressReleases.filter(release => release.featured).map((release) => (
              <article
                key={release.id}
                className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-colors"
              >
                <div className="aspect-video bg-zinc-800 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      Featured
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-zinc-400 mb-3">
                    <span>{release.category}</span>
                    <span>{new Date(release.date).toLocaleDateString()}</span>
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-white mb-3">
                    {release.title}
                  </h3>
                  
                  <p className="text-zinc-400 mb-6">
                    {release.excerpt}
                  </p>
                  
                  <Link
                    href={`/press/${release.id}`}
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Read Full Release
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          
          {/* Other Press Releases */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pressReleases.filter(release => !release.featured).map((release) => (
              <article
                key={release.id}
                className="bg-zinc-900 rounded-lg p-6 hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center justify-between text-sm text-zinc-400 mb-3">
                  <span>{release.category}</span>
                  <span>{new Date(release.date).toLocaleDateString()}</span>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-3">
                  {release.title}
                </h3>
                
                <p className="text-zinc-400 mb-4 line-clamp-2">
                  {release.excerpt}
                </p>
                
                <Link
                  href={`/press/${release.id}`}
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Media Coverage */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8">Media Coverage</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {mediaCoverage.map((coverage) => (
              <article
                key={coverage.publication}
                className="bg-zinc-800 rounded-lg p-6 hover:bg-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {coverage.publication}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {new Date(coverage.date).toLocaleDateString()}
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-zinc-400" />
                </div>
                
                <h4 className="text-white font-medium mb-2">
                  {coverage.title}
                </h4>
                
                <p className="text-zinc-400 mb-4 line-clamp-2">
                  {coverage.excerpt}
                </p>
                
                <Link
                  href={coverage.url}
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Read Article
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Media Assets */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8">Media Assets</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {downloadAssets.map((asset) => (
              <div
                key={asset.title}
                className="bg-zinc-900 rounded-lg p-6 hover:bg-zinc-800 transition-colors"
              >
                <FileText className="w-12 h-12 text-blue-400 mb-4" />
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {asset.title}
                </h3>
                
                <p className="text-zinc-400 text-sm mb-4">
                  {asset.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-zinc-400 mb-4">
                  <span>{asset.type}</span>
                  <span>{asset.size}</span>
                </div>
                
                <Button variant="outline" size="sm" className="rounded-full w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Media Inquiries
          </h2>
          <p className="text-zinc-400 mb-8">
            For press inquiries, interview requests, or additional information, please contact our PR team.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                General Press Inquiries
              </h3>
              <p className="text-zinc-400 mb-4">
                press@kits-hub.com
              </p>
              <Button variant="outline" size="sm" className="rounded-full">
                Send Email
              </Button>
            </div>
            
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Partnership Opportunities
              </h3>
              <p className="text-zinc-400 mb-4">
                partners@kits-hub.com
              </p>
              <Button variant="outline" size="sm" className="rounded-full">
                Send Email
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
