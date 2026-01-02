import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Shield, Eye, Lock, ArrowRight, Mail } from "lucide-react"

export default function Privacy() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Last updated: December 1, 2024
          </p>
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <p className="text-zinc-300">
              At KiTS Hub, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and protect your data when you use our business management platform.
            </p>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-4xl space-y-12">
          
          {/* Information We Collect */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Information We Collect</h2>
            
            <div className="space-y-6">
              <div className="bg-zinc-900 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Eye className="w-6 h-6 mr-3 text-blue-400" />
                  Personal Information
                </h3>
                <p className="text-zinc-300 mb-4">
                  We collect information you provide directly to us, such as when you create an account, contact support, or use our services.
                </p>
                <ul className="space-y-2 text-zinc-400">
                  <li>• Name, email address, and contact information</li>
                  <li>• Company information and job title</li>
                  <li>• Payment and billing information</li>
                  <li>• Account credentials and preferences</li>
                </ul>
              </div>

              <div className="bg-zinc-900 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-green-400" />
                  Business Data
                </h3>
                <p className="text-zinc-300 mb-4">
                  To provide our services, we collect and process business data that you input into our platform.
                </p>
                <ul className="space-y-2 text-zinc-400">
                  <li>• Customer information and CRM data</li>
                  <li>• Sales transactions and POS data</li>
                  <li>• Employee records and HR information</li>
                  <li>• Financial data and accounting records</li>
                  <li>• Inventory and product information</li>
                </ul>
              </div>

              <div className="bg-zinc-900 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Lock className="w-6 h-6 mr-3 text-purple-400" />
                  Technical Data
                </h3>
                <p className="text-zinc-300 mb-4">
                  We automatically collect technical information about your use of our services.
                </p>
                <ul className="space-y-2 text-zinc-400">
                  <li>• IP address and device information</li>
                  <li>• Browser type and operating system</li>
                  <li>• Usage patterns and feature interactions</li>
                  <li>• Performance and diagnostic data</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">How We Use Your Information</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                We use your information to provide, maintain, and improve our services:
              </p>
              <ul className="space-y-3 text-zinc-400">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3">•</span>
                  <span>Provide and operate the KiTS Hub platform</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3">•</span>
                  <span>Process transactions and manage your account</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3">•</span>
                  <span>Provide customer support and respond to inquiries</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3">•</span>
                  <span>Improve our services and develop new features</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3">•</span>
                  <span>Communicate with you about updates and offers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3">•</span>
                  <span>Ensure platform security and prevent fraud</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3">•</span>
                  <span>Comply with legal obligations</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Data Security */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Data Security</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Technical Security</h3>
                  <ul className="space-y-2 text-zinc-400">
                    <li>• 256-bit SSL encryption</li>
                    <li>• Regular security audits</li>
                    <li>• Intrusion detection systems</li>
                    <li>• Secure data centers</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Access Controls</h3>
                  <ul className="space-y-2 text-zinc-400">
                    <li>• Role-based permissions</li>
                    <li>• Multi-factor authentication</li>
                    <li>• Regular access reviews</li>
                    <li>• Employee training</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Your Rights</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="space-y-3 text-zinc-400">
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">•</span>
                  <span><strong>Access:</strong> Request a copy of your personal information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">•</span>
                  <span><strong>Correction:</strong> Update or correct inaccurate information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">•</span>
                  <span><strong>Deletion:</strong> Request deletion of your personal information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">•</span>
                  <span><strong>Portability:</strong> Transfer your data to another service</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">•</span>
                  <span><strong>Objection:</strong> Object to certain processing activities</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Data Retention */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Data Retention</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                We retain your information only as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete your personal information within 30 days, except where we are required to retain it for legal or security purposes.
              </p>
            </div>
          </div>

          {/* International Data Transfers */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">International Data Transfers</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                KiTS Hub operates globally and may transfer your data to countries other than your own. We ensure appropriate safeguards are in place for international data transfers, including standard contractual clauses and compliance with applicable data protection laws.
              </p>
            </div>
          </div>

          {/* Children's Privacy */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Children's Privacy</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we&apos;ll take steps to delete it promptly.
              </p>
            </div>
          </div>

          {/* Changes to This Policy */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Changes to This Policy</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date at the top.
              </p>
              <div className="bg-zinc-800 rounded p-4">
                <p className="text-zinc-400 text-sm">
                  Significant changes will be communicated via email or prominent notices within our platform.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Contact Us</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-6">
                If you have questions about this Privacy Policy or want to exercise your rights, please contact us:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center text-zinc-300">
                    <Mail className="w-5 h-5 mr-3 text-blue-400" />
                    privacy@kits-hub.com
                  </div>
                  <div className="flex items-center text-zinc-300">
                    <Mail className="w-5 h-5 mr-3 text-blue-400" />
                    dpo@kits-hub.com (Data Protection Officer)
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-zinc-300">
                    <strong>Mailing Address:</strong><br />
                    KiTS Hub Privacy Team<br />
                    123 Business Ave, Suite 100<br />
                    New York, NY 10001
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  )
}
