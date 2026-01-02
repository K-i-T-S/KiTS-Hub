import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Cookie, Settings, Shield, Eye, ArrowRight } from "lucide-react"

export default function Cookies() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Cookie Policy
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Last updated: December 1, 2024
          </p>
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <p className="text-zinc-300">
              This Cookie Policy explains how KiTS Hub uses cookies and similar technologies to recognize you when you visit our website and use our services.
            </p>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-4xl space-y-12">
          
          {/* What Are Cookies */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">What Are Cookies?</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.
              </p>
              <p className="text-zinc-300">
                Cookies allow us to recognize your device and remember information about your preferences and previous interactions with our website.
              </p>
            </div>
          </div>

          {/* How We Use Cookies */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">How We Use Cookies</h2>
            
            <div className="space-y-6">
              <div className="bg-zinc-900 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Settings className="w-6 h-6 mr-3 text-blue-400" />
                  Essential Cookies
                </h3>
                <p className="text-zinc-300 mb-4">
                  These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services.
                </p>
                <ul className="space-y-2 text-zinc-400">
                  <li>• Authentication and login status</li>
                  <li>• Security tokens</li>
                  <li>• Shopping cart contents</li>
                  <li>• Load balancing</li>
                </ul>
              </div>

              <div className="bg-zinc-900 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Eye className="w-6 h-6 mr-3 text-green-400" />
                  Performance Cookies
                </h3>
                <p className="text-zinc-300 mb-4">
                  These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.
                </p>
                <ul className="space-y-2 text-zinc-400">
                  <li>• Website analytics and usage statistics</li>
                  <li>• Error monitoring and reporting</li>
                  <li>• A/B testing and optimization</li>
                  <li>• Performance monitoring</li>
                </ul>
              </div>

              <div className="bg-zinc-900 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Cookie className="w-6 h-6 mr-3 text-purple-400" />
                  Functional Cookies
                </h3>
                <p className="text-zinc-300 mb-4">
                  These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.
                </p>
                <ul className="space-y-2 text-zinc-400">
                  <li>• Remembering your preferences</li>
                  <li>• Language and region settings</li>
                  <li>• Customized content and features</li>
                  <li>• Social media integration</li>
                </ul>
              </div>

              <div className="bg-zinc-900 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-orange-400" />
                  Marketing Cookies
                </h3>
                <p className="text-zinc-300 mb-4">
                  These cookies are used to make advertising messages more relevant to you and your interests. They are also used to track the effectiveness of advertising campaigns.
                </p>
                <ul className="space-y-2 text-zinc-400">
                  <li>• Ad personalization and targeting</li>
                  <li>• Campaign performance tracking</li>
                  <li>• Cross-site behavioral advertising</li>
                  <li>• Retargeting and remarketing</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Types of Cookies We Use */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Types of Cookies We Use</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Session Cookies</h3>
                  <p className="text-zinc-300">
                    These are temporary cookies that expire when you close your browser. They help us track your movement through our website during a single session.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Persistent Cookies</h3>
                  <p className="text-zinc-300">
                    These remain on your device for a set period or until you delete them. They help us recognize you when you return to our website.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">First-Party Cookies</h3>
                  <p className="text-zinc-300">
                    These are set by KiTS Hub directly and can only be read by our website.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Third-Party Cookies</h3>
                  <p className="text-zinc-300">
                    These are set by external services we use on our website, such as analytics, advertising, and social media plugins.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Third-Party Services */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Third-Party Services</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                We use the following third-party services that may set cookies on your device:
              </p>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Google Analytics</h3>
                  <p className="text-zinc-300">
                    Used for website analytics and performance monitoring. Google Analytics uses cookies to collect information about how visitors use our website.
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Stripe</h3>
                  <p className="text-zinc-300">
                    Used for payment processing. Stripe uses cookies to secure transactions and remember your payment preferences.
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-lg font-semibold text-white mb-2">HubSpot</h3>
                  <p className="text-zinc-300">
                    Used for marketing automation and customer relationship management. HubSpot uses cookies to track user interactions and personalize content.
                  </p>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Social Media Platforms</h3>
                  <p className="text-zinc-300">
                    Social media buttons and widgets may set cookies when you interact with them. These are controlled by the respective social media platforms.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Managing Cookies */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Managing Your Cookie Preferences</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                You have several options for managing cookies:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Cookie Consent Banner</h3>
                  <p className="text-zinc-300">
                    When you first visit our website, you&apos;ll see a cookie consent banner where you can accept or reject non-essential cookies.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Browser Settings</h3>
                  <p className="text-zinc-300 mb-2">
                    Most web browsers allow you to control cookies through their settings:
                  </p>
                  <ul className="space-y-1 text-zinc-400 ml-4">
                    <li>• Block all cookies</li>
                    <li>• Accept only first-party cookies</li>
                    <li>• Delete cookies when you close your browser</li>
                    <li>• View and delete individual cookies</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Cookie Settings Panel</h3>
                  <p className="text-zinc-300">
                    You can access our cookie settings panel at any time to update your preferences for different types of cookies.
                  </p>
                </div>
              </div>
              
              <div className="bg-zinc-800 rounded p-4 mt-6">
                <p className="text-zinc-400 text-sm">
                  <strong>Note:</strong> Disabling certain cookies may affect the functionality and performance of our website. Some features may not work properly without cookies.
                </p>
              </div>
            </div>
          </div>

          {/* Cookie Duration */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Cookie Duration</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                Different cookies have different lifespans:
              </p>
              
              <ul className="space-y-2 text-zinc-400">
                <li>• <strong>Session cookies:</strong> Deleted when you close your browser</li>
                <li>• <strong>Persistent cookies:</strong> Typically expire after 30 days to 2 years</li>
                <li>• <strong>Authentication cookies:</strong> Expire after 24 hours of inactivity</li>
                <li>• <strong>Analytics cookies:</strong> Expire after 2 years</li>
                <li>• <strong>Marketing cookies:</strong> Expire after 90 days to 1 year</li>
              </ul>
            </div>
          </div>

          {/* Your Rights */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Your Rights</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                Under applicable data protection laws, you have the right to:
              </p>
              
              <ul className="space-y-2 text-zinc-400">
                <li>• Accept or reject non-essential cookies</li>
                <li>• Withdraw consent at any time</li>
                <li>• Access information about cookies we use</li>
                <li>• Request deletion of your data collected via cookies</li>
                <li>• File a complaint with a data protection authority</li>
              </ul>
            </div>
          </div>

          {/* Updates to This Policy */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Updates to This Policy</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                We may update this Cookie Policy from time to time to reflect changes in our use of cookies or applicable laws. We will notify you of any significant changes by:
              </p>
              
              <ul className="space-y-2 text-zinc-400">
                <li>• Posting the updated policy on our website</li>
                <li>• Updating the &quot;Last updated&quot; date</li>
                <li>• Displaying a notice on our website</li>
                <li>• Sending you an email notification for major changes</li>
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Contact Us</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                If you have questions about this Cookie Policy or how we use cookies, please contact us:
              </p>
              
              <div className="space-y-2 text-zinc-300">
                <p><strong>Email:</strong> privacy@kits-hub.com</p>
                <p><strong>Address:</strong> KiTS Hub Privacy Team, 123 Business Ave, Suite 100, New York, NY 10001</p>
              </div>
              
              <div className="mt-6">
                <Button className="rounded-full">
                  Update Cookie Preferences
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  )
}
