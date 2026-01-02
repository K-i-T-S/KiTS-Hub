import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, MessageSquare, Send, HelpCircle } from "lucide-react"

const contactMethods = [
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Get instant help from our support team",
    action: "Start Chat",
    available: "24/7",
    color: "bg-blue-600"
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us a detailed message",
    action: "Send Email",
    available: "Response within 24 hours",
    color: "bg-green-600"
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak with a support specialist",
    action: "Call Now",
    available: "Mon-Fri, 9AM-6PM EST",
    color: "bg-purple-600"
  },
  {
    icon: HelpCircle,
    title: "Help Center",
    description: "Find answers in our knowledge base",
    action: "Browse Articles",
    available: "Always available",
    color: "bg-orange-600"
  }
]

const offices = [
  {
    city: "New York",
    address: "123 Business Ave, Suite 100",
    cityState: "New York, NY 10001",
    phone: "+1 (555) 123-4567",
    email: "nyc@kits-hub.com"
  },
  {
    city: "San Francisco",
    address: "456 Tech Street, Floor 5",
    cityState: "San Francisco, CA 94105",
    phone: "+1 (555) 987-6543",
    email: "sf@kits-hub.com"
  },
  {
    city: "London",
    address: "789 Business Park, Building A",
    cityState: "London, UK EC1A 1BB",
    phone: "+44 20 7123 4567",
    email: "london@kits-hub.com"
  },
  {
    city: "Singapore",
    address: "321 Innovation Hub, Tower 2",
    cityState: "Singapore 238874",
    phone: "+65 6123 4567",
    email: "singapore@kits-hub.com"
  }
]

const departments = [
  {
    name: "Sales",
    email: "sales@kits-hub.com",
    phone: "+1 (555) 123-4567",
    description: "New sales inquiries and product demonstrations"
  },
  {
    name: "Customer Support",
    email: "support@kits-hub.com",
    phone: "+1 (555) 234-5678",
    description: "Technical support and account assistance"
  },
  {
    name: "Partnerships",
    email: "partners@kits-hub.com",
    phone: "+1 (555) 345-6789",
    description: "Partnership opportunities and integrations"
  },
  {
    name: "Press & Media",
    email: "press@kits-hub.com",
    phone: "+1 (555) 456-7890",
    description: "Media inquiries and press relations"
  }
]

const faqItems = [
  {
    question: "What is KiTS Hub?",
    answer: "KiTS Hub is an all-in-one business management platform that combines CRM, POS, HR, accounting, and analytics tools in one integrated system."
  },
  {
    question: "How do I get started?",
    answer: "You can start with a free 14-day trial by signing up on our website. No credit card required. Our team will help you set up your account."
  },
  {
    question: "What kind of support do you offer?",
    answer: "We offer 24/7 live chat, email support with 24-hour response time, phone support during business hours, and comprehensive documentation."
  },
  {
    question: "Can I integrate with other tools?",
    answer: "Yes! KiTS Hub integrates with over 50+ popular business tools including QuickBooks, Slack, Google Workspace, and more."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use bank-level encryption, regular security audits, and comply with GDPR, CCPA, and other data protection regulations."
  },
  {
    question: "Do you offer custom pricing?",
    answer: "Yes, we offer custom pricing for enterprise customers with specific needs. Contact our sales team to discuss your requirements."
  }
]

export default function Contact() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            We&apos;re here to help. Reach out to our team for support, sales, or any questions about KiTS Hub.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method) => (
              <div
                key={method.title}
                className="bg-zinc-900 rounded-lg p-6 text-center hover:bg-zinc-800 transition-colors"
              >
                <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <method.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {method.title}
                </h3>
                
                <p className="text-zinc-400 text-sm mb-4">
                  {method.description}
                </p>
                
                <p className="text-zinc-400 text-xs mb-4">
                  {method.available}
                </p>
                
                <Button variant="outline" size="sm" className="rounded-full">
                  {method.action}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Send Us a Message
          </h2>
          
          <div className="bg-zinc-800 rounded-lg p-8">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">First Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Company</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-white mb-2">Department</label>
                <select className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  <option value="">Select a department</option>
                  <option value="sales">Sales</option>
                  <option value="support">Customer Support</option>
                  <option value="partnerships">Partnerships</option>
                  <option value="press">Press & Media</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white mb-2">Message</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-zinc-400">
                  We&apos;ll respond within 24 hours
                </div>
                <Button className="rounded-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Contact by Department
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {departments.map((dept) => (
              <div key={dept.name} className="bg-zinc-900 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {dept.name}
                </h3>
                
                <p className="text-zinc-400 mb-4">
                  {dept.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-zinc-300">
                    <Mail className="w-4 h-4 mr-3 text-blue-400" />
                    {dept.email}
                  </div>
                  <div className="flex items-center text-zinc-300">
                    <Phone className="w-4 h-4 mr-3 text-green-400" />
                    {dept.phone}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Our Offices
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {offices.map((office) => (
              <div key={office.city} className="bg-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {office.city}
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start text-zinc-300">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 text-blue-400 flex-shrink-0" />
                    <div>
                      <div>{office.address}</div>
                      <div>{office.cityState}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-zinc-300">
                    <Phone className="w-4 h-4 mr-2 text-green-400" />
                    {office.phone}
                  </div>
                  <div className="flex items-center text-zinc-300">
                    <Mail className="w-4 h-4 mr-2 text-blue-400" />
                    {office.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-zinc-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {item.question}
                </h3>
                <p className="text-zinc-400">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button variant="outline" className="rounded-full">
              View All FAQ
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
