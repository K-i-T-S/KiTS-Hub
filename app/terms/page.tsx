import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Shield, Users, AlertCircle } from "lucide-react"

export default function Terms() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Last updated: December 1, 2024
          </p>
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <p className="text-zinc-300">
              These Terms of Service govern your use of KiTS Hub, our business management platform. By using our services, you agree to these terms.
            </p>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-4xl space-y-12">
          
          {/* Acceptance of Terms */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">1. Acceptance of Terms</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                By accessing and using KiTS Hub, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.
              </p>
              <p className="text-zinc-300">
                These terms apply to all users of KiTS Hub, including paid and free users, as well as users accessing our services through third-party platforms.
              </p>
            </div>
          </div>

          {/* Description of Service */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">2. Description of Service</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                KiTS Hub is an all-in-one business management platform that includes:
              </p>
              <ul className="space-y-2 text-zinc-400 mb-4">
                <li>• Customer Relationship Management (CRM)</li>
                <li>• Point of Sale (POS) systems</li>
                <li>• Human Resources management</li>
                <li>• Accounting and financial management</li>
                <li>• Analytics and reporting tools</li>
                <li>• Inventory management</li>
              </ul>
              <p className="text-zinc-300">
                We reserve the right to modify, suspend, or discontinue any part of our service at any time.
              </p>
            </div>
          </div>

          {/* User Accounts */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">3. User Accounts</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Users className="w-6 h-6 mr-3 text-blue-400" />
                Account Registration
              </h3>
              <p className="text-zinc-300 mb-4">
                To use KiTS Hub, you must create an account and provide accurate, complete, and current information. You are responsible for:
              </p>
              <ul className="space-y-2 text-zinc-400 mb-6">
                <li>• Maintaining the confidentiality of your account credentials</li>
                <li>• All activities that occur under your account</li>
                <li>• Notifying us immediately of any unauthorized use</li>
                <li>• Providing accurate and up-to-date information</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-4">Account Termination</h3>
              <p className="text-zinc-300">
                You may terminate your account at any time. We may also suspend or terminate your account for violation of these terms or for any other reason at our sole discretion.
              </p>
            </div>
          </div>

          {/* User Responsibilities */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">4. User Responsibilities</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                As a user of KiTS Hub, you agree to:
              </p>
              <ul className="space-y-3 text-zinc-400">
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">•</span>
                  <span>Use the service only for lawful business purposes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">•</span>
                  <span>Provide accurate and complete business information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">•</span>
                  <span>Comply with all applicable laws and regulations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">•</span>
                  <span>Not attempt to gain unauthorized access to our systems</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">•</span>
                  <span>Not interfere with or disrupt the service</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">•</span>
                  <span>Not upload malicious code or harmful content</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">•</span>
                  <span>Respect the intellectual property rights of others</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Terms */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">5. Payment Terms</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Subscription Fees</h3>
              <p className="text-zinc-300 mb-4">
                KiTS Hub offers both free and paid subscription plans. Paid plans are billed on a monthly or annual basis, as selected during signup.
              </p>
              
              <h3 className="text-xl font-semibold text-white mb-4">Payment Methods</h3>
              <p className="text-zinc-300 mb-4">
                We accept major credit cards, debit cards, and other payment methods as specified on our website. You agree to provide current, complete, and accurate payment information.
              </p>
              
              <h3 className="text-xl font-semibold text-white mb-4">Refunds</h3>
              <p className="text-zinc-300 mb-4">
                We offer a 14-day free trial for new paid plans. After the trial period, refunds are provided on a case-by-case basis within 30 days of purchase, subject to our refund policy.
              </p>
              
              <h3 className="text-xl font-semibold text-white mb-4">Auto-Renewal</h3>
              <p className="text-zinc-300">
                Subscriptions automatically renew unless cancelled before the renewal date. You can manage or cancel your subscription at any time through your account settings.
              </p>
            </div>
          </div>

          {/* Intellectual Property */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">6. Intellectual Property</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-3 text-purple-400" />
                Our Rights
              </h3>
              <p className="text-zinc-300 mb-4">
                KiTS Hub and all related content, features, and functionality are owned by KiTS Hub Inc. and are protected by copyright, trademark, and other intellectual property laws.
              </p>
              
              <h3 className="text-xl font-semibold text-white mb-4">Your Rights</h3>
              <p className="text-zinc-300 mb-4">
                You retain ownership of any business data you input into KiTS Hub. You grant us a license to use, process, and store your data solely to provide and improve our services.
              </p>
              
              <h3 className="text-xl font-semibold text-white mb-4">Usage Restrictions</h3>
              <p className="text-zinc-300">
                You may not copy, modify, distribute, or create derivative works of our service without our explicit written permission.
              </p>
            </div>
          </div>

          {/* Privacy and Data Protection */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">7. Privacy and Data Protection</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <p className="text-zinc-300">
                By using KiTS Hub, you consent to the collection and use of your information as described in our Privacy Policy.
              </p>
            </div>
          </div>

          {/* Service Availability */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">8. Service Availability</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                We strive to maintain high availability of our services, but we cannot guarantee 100% uptime. We may experience scheduled or unscheduled downtime for maintenance, updates, or other reasons.
              </p>
              <p className="text-zinc-300">
                We are not liable for any losses or damages resulting from service interruptions or downtime.
              </p>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">9. Limitation of Liability</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <AlertCircle className="w-6 h-6 mr-3 text-red-400" />
                Disclaimer of Warranties
              </h3>
              <p className="text-zinc-300 mb-4">
                KiTS Hub is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. We do not guarantee that the service will be error-free or uninterrupted.
              </p>
              
              <h3 className="text-xl font-semibold text-white mb-4">Limitation of Damages</h3>
              <p className="text-zinc-300">
                To the maximum extent permitted by law, KiTS Hub shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services, including loss of profits, data, or business opportunities.
              </p>
            </div>
          </div>

          {/* Indemnification */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">10. Indemnification</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300">
                You agree to indemnify and hold KiTS harmless from any claims, damages, or expenses arising from your use of our services, violation of these terms, or infringement of any third-party rights.
              </p>
            </div>
          </div>

          {/* Termination */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">11. Termination</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including if you breach the Terms.
              </p>
              <p className="text-zinc-300">
                Upon termination, your right to use the service will cease immediately. All provisions of the Terms shall survive termination, including ownership rights and warranty disclaimers.
              </p>
            </div>
          </div>

          {/* Governing Law */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">12. Governing Law</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300">
                These Terms of Service are governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law principles.
              </p>
            </div>
          </div>

          {/* Changes to Terms */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">13. Changes to Terms</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to our website.
              </p>
              <p className="text-zinc-300">
                Your continued use of the service after any changes constitutes acceptance of the new Terms.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">14. Contact Information</h2>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <p className="text-zinc-300 mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              
              <div className="space-y-2 text-zinc-300">
                <p><strong>Email:</strong> legal@kits-hub.com</p>
                <p><strong>Address:</strong> KiTS Hub Legal Department, 123 Business Ave, Suite 100, New York, NY 10001</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  )
}
