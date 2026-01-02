import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"

const blogPosts = [
  {
    id: 1,
    title: "5 Ways CRM Can Transform Your Business",
    excerpt: "Discover how implementing a robust CRM system can revolutionize your customer relationships and drive growth.",
    date: "2024-12-15",
    readTime: "5 min read",
    category: "CRM",
    image: "/blog/crm-transform.jpg"
  },
  {
    id: 2,
    title: "The Future of Point of Sale Systems",
    excerpt: "Explore emerging trends in POS technology and how they're reshaping retail and hospitality businesses.",
    date: "2024-12-10",
    readTime: "7 min read",
    category: "POS",
    image: "/blog/pos-future.jpg"
  },
  {
    id: 3,
    title: "HR Management in the Digital Age",
    excerpt: "Learn how modern HR management tools are streamlining operations and improving employee experiences.",
    date: "2024-12-05",
    readTime: "6 min read",
    category: "HR",
    image: "/blog/hr-digital.jpg"
  },
  {
    id: 4,
    title: "Accounting Automation Best Practices",
    excerpt: "Streamline your financial processes with these proven accounting automation strategies.",
    date: "2024-11-28",
    readTime: "8 min read",
    category: "Accounting",
    image: "/blog/accounting-auto.jpg"
  },
  {
    id: 5,
    title: "Data Analytics for Small Business",
    excerpt: "How to leverage business analytics to make informed decisions and drive growth.",
    date: "2024-11-20",
    readTime: "6 min read",
    category: "Analytics",
    image: "/blog/analytics-small.jpg"
  },
  {
    id: 6,
    title: "Choosing the Right Business Management Platform",
    excerpt: "A comprehensive guide to selecting the perfect all-in-one solution for your business needs.",
    date: "2024-11-15",
    readTime: "10 min read",
    category: "Guide",
    image: "/blog/platform-guide.jpg"
  }
]

const categories = ["All", "CRM", "POS", "HR", "Accounting", "Analytics", "Guide"]

export default function Blog() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Business Insights & Resources
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Expert tips, industry trends, and best practices to help your business thrive with KiTS Hub.
          </p>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-colors"
              >
                <div className="aspect-video bg-zinc-800 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center text-sm text-zinc-400 mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(post.date).toLocaleDateString()}
                    <Clock className="w-4 h-4 ml-4 mr-2" />
                    {post.readTime}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-zinc-400 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <Link
                    href={`/blog/${post.id}`}
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          
          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="rounded-full">
              Load More Articles
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-zinc-400 mb-8">
            Get the latest business insights and tips delivered straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
            />
            <Button className="rounded-full">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
