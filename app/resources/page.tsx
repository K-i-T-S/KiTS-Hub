import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowRight, Search } from "lucide-react"

const blogPosts = [
  {
    id: 1,
    title: "10 Ways to Improve Your Customer Relationship Management",
    excerpt: "Discover proven strategies to enhance your CRM processes and build stronger customer relationships that drive growth.",
    category: "CRM",
    author: "Sarah Johnson",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
    date: "2024-12-15",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&h=400&auto=format&fit=crop",
    featured: true
  },
  {
    id: 2,
    title: "The Future of Point of Sale Systems",
    excerpt: "Explore how modern POS technology is transforming retail operations and customer experiences.",
    category: "POS",
    author: "Michael Chen",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop",
    date: "2024-12-10",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&h=400&auto=format&fit=crop",
    featured: false
  },
  {
    id: 3,
    title: "HR Management Best Practices for Growing Teams",
    excerpt: "Learn how to scale your HR processes effectively as your team grows from startup to enterprise.",
    category: "HR",
    author: "Emily Rodriguez",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200",
    date: "2024-12-08",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1512907867400-801927e8a902?q=80&w=800&h=400&auto=format&fit=crop",
    featured: false
  },
  {
    id: 4,
    title: "Accounting Automation: Save Time and Reduce Errors",
    excerpt: "Discover how automation can revolutionize your accounting processes and free up valuable time.",
    category: "Accounting",
    author: "David Kim",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop",
    date: "2024-12-05",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1554224155-6d12bce48665?q=80&w=800&h=400&auto=format&fit=crop",
    featured: false
  },
  {
    id: 5,
    title: "Data Analytics for Small Business Owners",
    excerpt: "Learn how to leverage data analytics to make informed decisions and drive business growth.",
    category: "Analytics",
    author: "Lisa Thompson",
    authorAvatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?q=80&w=200&h=200&auto=format&fit=crop",
    date: "2024-12-01",
    readTime: "9 min read",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&h=400&auto=format&fit=crop",
    featured: false
  },
  {
    id: 6,
    title: "Building a Customer-Centric Business Culture",
    excerpt: "Transform your organization by putting customers at the center of every decision you make.",
    category: "Business",
    author: "James Wilson",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop",
    date: "2024-11-28",
    readTime: "12 min read",
    image: "https://images.unsplash.com/photo-1515189031309-9a2e2b8f4167?q=80&w=800&h=400&auto=format&fit=crop",
    featured: false
  }
]

const categories = [
  { name: "All", count: 24 },
  { name: "CRM", count: 8 },
  { name: "POS", count: 6 },
  { name: "HR", count: 5 },
  { name: "Accounting", count: 4 },
  { name: "Analytics", count: 3 },
  { name: "Business", count: 7 }
]

const popularPosts = [
  {
    title: "Complete Guide to CRM Implementation",
    readTime: "15 min read"
  },
  {
    title: "POS Security Best Practices",
    readTime: "8 min read"
  },
  {
    title: "HR Metrics That Matter",
    readTime: "10 min read"
  },
  {
    title: "Tax Preparation Checklist",
    readTime: "12 min read"
  }
]

export default function ResourcesPage() {
  const featuredPost = blogPosts.find(post => post.featured)
  const regularPosts = blogPosts.filter(post => !post.featured)

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      <main className="py-20">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Resources & Insights
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Expert advice, best practices, and industry insights to help you grow your business.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:border-transparent focus:shadow-lg focus:shadow-purple-500/20 transition-all duration-300"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant={category.name === "All" ? "default" : "outline"}
                  size="sm"
                  className={category.name === "All" ? "bg-gradient-to-r from-[#9333ea] via-[#a855f7] to-[#7c3aed] hover:from-[#7c3aed] hover:via-[#9333ea] hover:to-[#6b21a8] text-white shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105" : ""}
                >
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Featured Post */}
              {featuredPost && (
                <Card className="bg-card border-border/50 mb-12 overflow-hidden">
                  <div className="relative h-64 md:h-80">
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <Badge className="bg-gradient-to-r from-[#9333ea] to-[#7c3aed] text-white shadow-lg shadow-purple-500/30 mb-3">Featured</Badge>
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                        {featuredPost.title}
                      </h2>
                      <p className="text-zinc-300 mb-4 line-clamp-2">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <div className="flex items-center gap-2">
                          <img
                            src={featuredPost.authorAvatar}
                            alt={featuredPost.author}
                            className="w-6 h-6 rounded-full"
                          />
                          <span>{featuredPost.author}</span>
                        </div>
                        <span>•</span>
                        <span>{featuredPost.date}</span>
                        <span>•</span>
                        <span>{featuredPost.readTime}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <Button className="bg-gradient-to-r from-[#9333ea] via-[#a855f7] to-[#7c3aed] hover:from-[#7c3aed] hover:via-[#9333ea] hover:to-[#6b21a8] text-white shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
                      Read Full Article
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Regular Posts Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                {regularPosts.map((post) => (
                  <Card key={post.id} className="bg-card border-border/50 overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="relative h-48">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-zinc-900/80 text-white">
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-[#9333ea] group-hover:to-[#7c3aed] group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{post.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="group-hover:bg-gradient-to-r group-hover:from-[#f3e8ff] group-hover:to-[#e9d5ff] text-current group-hover:text-[#581c87] hover:text-[#581c87] transition-all duration-300 group-hover:shadow-md group-hover:shadow-purple-500/20">
                          Read More
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform group-hover:text-[#581c87]" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-12">
                <Button variant="outline" size="lg" className="border-2 border-[#9333ea] text-[#9333ea] hover:bg-gradient-to-r hover:from-[#9333ea] hover:to-[#7c3aed] hover:text-white hover:border-transparent transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25">
                  Load More Articles
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Newsletter Signup */}
              <Card className="bg-gradient-to-br from-[#2e0f38] via-[#4a0e4e] to-[#551a8b] border-none text-white mb-8 shadow-xl shadow-purple-500/25">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3">Stay Updated</h3>
                  <p className="text-white/90 mb-4">
                    Get the latest business insights and tips delivered to your inbox weekly.
                  </p>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 mb-4"
                  />
                  <Button className="w-full bg-white text-[#9333ea] hover:bg-gradient-to-r hover:from-[#f3e8ff] hover:to-[#e9d5ff] hover:text-[#7c3aed] transition-all duration-300 shadow-lg shadow-purple-500/25">
                    Subscribe
                  </Button>
                </CardContent>
              </Card>

              {/* Popular Posts */}
              <Card className="bg-card border-border/50 mb-8">
                <CardHeader>
                  <CardTitle>Popular Posts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {popularPosts.map((post, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="bg-gradient-to-r from-[#9333ea] to-[#7c3aed] bg-clip-text text-transparent font-bold text-lg">0{index + 1}</span>
                      <div>
                        <h4 className="font-medium group-hover:bg-gradient-to-r group-hover:from-[#9333ea] group-hover:to-[#7c3aed] group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 cursor-pointer">
                          {post.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">{post.readTime}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Categories */}
              <Card className="bg-card border-border/50">
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.slice(1).map((category) => (
                    <div key={category.name} className="flex items-center justify-between py-2 group-hover:bg-gradient-to-r group-hover:from-[#f3e8ff] group-hover:to-[#e9d5ff] group-hover:rounded-lg transition-all duration-300 cursor-pointer">
                      <span className="group-hover:text-[#9333ea] transition-colors duration-300">{category.name}</span>
                      <Badge variant="secondary">{category.count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
