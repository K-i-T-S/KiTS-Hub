import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Shield, Lock, Server, Users, AlertTriangle, CheckCircle, ArrowRight, Award } from "lucide-react"

const securityFeatures = [
  {
    icon: Lock,
    title: "Data Encryption",
    description: "256-bit SSL/TLS encryption for all data in transit and at rest",
    details: [
      "AES-256 encryption for stored data",
      "TLS 1.3 for all network communications",
      "End-to-end encryption for sensitive data",
      "Regular encryption key rotation"
    ]
  },
  {
    icon: Server,
    title: "Secure Infrastructure",
    description: "Enterprise-grade infrastructure with multiple security layers",
    details: [
      "SOC 2 Type II certified data centers",
      "24/7 physical security monitoring",
      "Redundant power and cooling systems",
      "Geographic data distribution"
    ]
  },
  {
    icon: Users,
    title: "Access Control",
    description: "Granular permissions and multi-factor authentication",
    details: [
      "Role-based access control (RBAC)",
      "Multi-factor authentication (MFA)",
      "Single Sign-On (SSO) support",
      "Session timeout and auto-lock"
    ]
  },
  {
    icon: Shield,
    title: "Compliance & Audits",
    description: "Regular security audits and compliance certifications",
    details: [
      "Annual penetration testing",
      "Vulnerability scanning and assessment",
      "GDPR and CCPA compliance",
      "ISO 27001 certification"
    ]
  }
]

const complianceStandards = [
  {
    name: "GDPR",
    description: "General Data Protection Regulation",
    status: "Compliant",
    icon: CheckCircle
  },
  {
    name: "CCPA",
    description: "California Consumer Privacy Act",
    status: "Compliant",
    icon: CheckCircle
  },
  {
    name: "SOC 2 Type II",
    description: "Service Organization Control 2",
    status: "Certified",
    icon: Award
  },
  {
    name: "ISO 27001",
    description: "Information Security Management",
    status: "Certified",
    icon: Award
  },
  {
    name: "HIPAA",
    description: "Health Insurance Portability and Accountability Act",
    status: "Compliant",
    icon: CheckCircle
  },
  {
    name: "PCI DSS",
    description: "Payment Card Industry Data Security Standard",
    status: "Compliant",
    icon: CheckCircle
  }
]

const securityMetrics = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "256-bit", label: "Encryption" },
  { value: "24/7", label: "Monitoring" },
  { value: "0", label: "Major Breaches" }
]

const bestPractices = [
  {
    title: "Regular Security Training",
    description: "All employees undergo regular security awareness training and phishing simulations."
  },
  {
    title: "Incident Response Plan",
    description: "Comprehensive incident response procedures with regular drills and updates."
  },
  {
    title: "Secure Development Lifecycle",
    description: "Security integrated throughout the software development process."
  },
  {
    title: "Third-Party Security",
    description: "Rigorous security assessment of all third-party vendors and integrations."
  }
]

export default function Security() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <Shield className="w-16 h-16 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Security & Compliance
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            We&apos;re committed to protecting your data with enterprise-grade security and comprehensive compliance measures.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {securityMetrics.map((metric) => (
              <div key={metric.label} className="bg-zinc-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-white mb-1">
                  {metric.value}
                </div>
                <div className="text-zinc-400 text-sm">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Security Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {securityFeatures.map((feature) => (
              <div key={feature.title} className="bg-zinc-900 rounded-lg p-6">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
                
                <ul className="space-y-2">
                  {feature.details.map((detail) => (
                    <li key={detail} className="flex items-start text-zinc-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Standards */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Compliance & Certifications
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceStandards.map((standard) => (
              <div key={standard.name} className="bg-zinc-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {standard.name}
                  </h3>
                  <standard.icon className={`w-6 h-6 ${
                    standard.status === 'Certified' ? 'text-yellow-400' : 'text-green-400'
                  }`} />
                </div>
                
                <p className="text-zinc-400 text-sm mb-3">
                  {standard.description}
                </p>
                
                <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                  standard.status === 'Certified' 
                    ? 'bg-yellow-600/20 text-yellow-400' 
                    : 'bg-green-600/20 text-green-400'
                }`}>
                  {standard.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Data Protection Measures
          </h2>
          
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Data Encryption
              </h3>
              <p className="text-zinc-300 mb-4">
                All data is encrypted using industry-standard protocols:
              </p>
              <ul className="space-y-2 text-zinc-400">
                <li>• AES-256 encryption for data at rest</li>
                <li>• TLS 1.3 for data in transit</li>
                <li>• Encrypted backups with secure key management</li>
                <li>• Hardware security modules (HSMs) for key storage</li>
              </ul>
            </div>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Access Management
              </h3>
              <p className="text-zinc-300 mb-4">
                Strict access controls ensure only authorized personnel can access your data:
              </p>
              <ul className="space-y-2 text-zinc-400">
                <li>• Principle of least privilege access</li>
                <li>• Multi-factor authentication for all systems</li>
                <li>• Regular access reviews and audits</li>
                <li>• Detailed logging and monitoring</li>
              </ul>
            </div>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Network Security
              </h3>
              <p className="text-zinc-300 mb-4">
                Multiple layers of network protection defend against threats:
              </p>
              <ul className="space-y-2 text-zinc-400">
                <li>• Web Application Firewall (WAF)</li>
                <li>• DDoS protection and mitigation</li>
                <li>• Intrusion detection and prevention systems</li>
                <li>• Network segmentation and isolation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security Best Practices */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Security Best Practices
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {bestPractices.map((practice) => (
              <div key={practice.title} className="bg-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {practice.title}
                </h3>
                <p className="text-zinc-400">
                  {practice.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Incident Response */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Incident Response
          </h2>
          
          <div className="bg-zinc-900 rounded-lg p-8">
            <div className="flex items-center mb-6">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mr-4" />
              <h3 className="text-2xl font-semibold text-white">
                24/7 Security Monitoring
              </h3>
            </div>
            
            <p className="text-zinc-300 mb-6">
              Our security team monitors all systems 24/7 and responds immediately to any potential threats. Our incident response process includes:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Detection</h4>
                <ul className="space-y-1 text-zinc-400">
                  <li>• Real-time threat monitoring</li>
                  <li>• Automated security alerts</li>
                  <li>• Behavioral analysis</li>
                  <li>• Anomaly detection</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Response</h4>
                <ul className="space-y-1 text-zinc-400">
                  <li>• Immediate threat containment</li>
                  <li>• Root cause analysis</li>
                  <li>• System recovery</li>
                  <li>• Customer notification</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Security Responsibilities */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Your Security Responsibilities
          </h2>
          
          <div className="bg-zinc-800 rounded-lg p-6">
            <p className="text-zinc-300 mb-4">
              While we provide robust security measures, maintaining security is a shared responsibility. Here&apos;s how you can help keep your account secure:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Account Security</h4>
                <ul className="space-y-2 text-zinc-400">
                  <li>• Use strong, unique passwords</li>
                  <li>• Enable multi-factor authentication</li>
                  <li>• Regularly review access permissions</li>
                  <li>• Keep login credentials secure</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Data Protection</h4>
                <ul className="space-y-2 text-zinc-400">
                  <li>• Only share data with authorized users</li>
                  <li>• Regularly backup important data</li>
                  <li>• Review and update user permissions</li>
                  <li>• Monitor account activity</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report Security Issues */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Report a Security Issue
          </h2>
          <p className="text-zinc-400 mb-8">
            If you discover a security vulnerability, please report it to us immediately. We take all security reports seriously.
          </p>
          
          <div className="bg-zinc-900 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              Security Contact Information
            </h3>
            <div className="space-y-2 text-zinc-300">
              <p><strong>Email:</strong> security@kits-hub.com</p>
              <p><strong>Response Time:</strong> Within 24 hours</p>
              <p><strong>PGP Key:</strong> Available upon request</p>
            </div>
          </div>
          
          <Button className="rounded-full">
            Report Vulnerability
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
