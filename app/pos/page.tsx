import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { ShoppingCart, CreditCard, Package, TrendingUp, CheckCircle, Star, Zap } from "lucide-react"

const features = [
  {
    icon: ShoppingCart,
    title: "Point of Sale",
    description: "Fast, reliable checkout process with multiple payment options",
    benefits: ["Quick checkout", "Multiple payment methods", "Receipt printing", "Barcode scanning"]
  },
  {
    icon: CreditCard,
    title: "Payment Processing",
    description: "Secure payment processing with all major credit cards and digital wallets",
    benefits: ["Credit/debit cards", "Mobile payments", "Contactless payments", "Split payments"]
  },
  {
    icon: Package,
    title: "Inventory Management",
    description: "Real-time inventory tracking and automatic stock updates",
    benefits: ["Real-time stock levels", "Low stock alerts", "Product variations", "Supplier management"]
  },
  {
    icon: TrendingUp,
    title: "Sales Analytics",
    description: "Comprehensive reporting and insights to optimize your retail operations",
    benefits: ["Sales reports", "Customer analytics", "Product performance", "Trend analysis"]
  }
]

const hardwareOptions = [
  {
    name: "POS Terminal",
    description: "All-in-one touchscreen terminal",
    price: "$499",
    image: "/hardware/terminal.jpg"
  },
  {
    name: "Receipt Printer",
    description: "Thermal receipt printer",
    price: "$149",
    image: "/hardware/printer.jpg"
  },
  {
    name: "Barcode Scanner",
    description: "USB barcode scanner",
    price: "$89",
    image: "/hardware/scanner.jpg"
  },
  {
    name: "Cash Drawer",
    description: "Secure cash drawer with lock",
    price: "$199",
    image: "/hardware/drawer.jpg"
  }
]

const integrations = [
  { name: "Square", logo: "/integrations/square.png", description: "Payment processing" },
  { name: "Stripe", logo: "/integrations/stripe.png", description: "Online payments" },
  { name: "PayPal", logo: "/integrations/paypal.png", description: "Digital payments" },
  { name: "QuickBooks", logo: "/integrations/quickbooks.png", description: "Accounting sync" },
  { name: "Shopify", logo: "/integrations/shopify.png", description: "E-commerce" },
  { name: "Mailchimp", logo: "/integrations/mailchimp.png", description: "Email marketing" }
]

const testimonials = [
  {
    name: "David Martinez",
    role: "Store Owner",
    company: "Martinez Retail",
    content: "KiTS Hub POS has revolutionized our checkout process. What used to take 10 minutes now takes less than 2.",
    rating: 5
  },
  {
    name: "Lisa Thompson",
    role: "Restaurant Manager",
    company: "The Bistro",
    content: "The inventory management features alone have saved us thousands in waste and overstocking.",
    rating: 5
  },
  {
    name: "James Wilson",
    role: "Operations Director",
    company: "Fashion Forward",
    content: "Best POS system we've ever used. Reliable, fast, and the customer support is exceptional.",
    rating: 5
  }
]

const pricing = [
  {
    name: "Basic",
    price: "$49",
    locations: "1 location",
    features: [
      "POS software",
      "Payment processing",
      "Basic inventory",
      "Sales reports",
      "Mobile app"
    ],
    highlighted: false
  },
  {
    name: "Plus",
    price: "$99",
    locations: "Up to 3 locations",
    features: [
      "Everything in Basic",
      "Advanced inventory",
      "Customer management",
      "Employee management",
      "Online ordering",
      "API access"
    ],
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    locations: "Unlimited locations",
    features: [
      "Everything in Plus",
      "Multi-store management",
      "Custom branding",
      "Advanced analytics",
      "Dedicated support",
      "White-label options"
    ],
    highlighted: false
  }
]

export default function POS() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <ShoppingCart className="w-16 h-16 text-green-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Point of Sale System
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Modern POS solution for retail and hospitality. Fast checkout, inventory management, and powerful analytics in one system.
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
            Complete POS Solution
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-zinc-900 rounded-lg p-6">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
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

      {/* Hardware */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            POS Hardware Options
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hardwareOptions.map((hardware) => (
              <div key={hardware.name} className="bg-zinc-800 rounded-lg p-6">
                <div className="aspect-square bg-zinc-700 rounded-lg mb-4"></div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {hardware.name}
                </h3>
                <p className="text-zinc-400 text-sm mb-3">
                  {hardware.description}
                </p>
                <div className="text-green-400 font-semibold">
                  {hardware.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Businesses Choose Our POS
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">50%</div>
              <div className="text-zinc-400">Faster Checkout Times</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">30%</div>
              <div className="text-zinc-400">Inventory Cost Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">99.9%</div>
              <div className="text-zinc-400">System Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Seamless Integrations
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
            Trusted by Retailers Everywhere
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
            Simple Pricing for Any Business
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`bg-zinc-800 rounded-lg p-8 ${
                  plan.highlighted ? 'ring-2 ring-green-500' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-green-500 text-white text-sm px-3 py-1 rounded-full text-center mb-4">
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
                  {plan.locations}
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
                    plan.highlighted ? 'bg-green-500 hover:bg-green-600' : ''
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
          <Zap className="w-16 h-16 text-green-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Upgrade Your POS System?
          </h2>
          <p className="text-zinc-400 mb-8">
            Join thousands of retailers using KiTS Hub POS to streamline operations and boost sales.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-green-500"
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
