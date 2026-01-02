import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle, FileText, Users, ArrowRight, Award, Globe, Lock } from "lucide-react"

const complianceAreas = [
  {
    icon: Globe,
    title: "Data Privacy",
    description: "Comprehensive data protection and privacy controls",
    standards: ["GDPR", "CCPA", "LGPD", "PIPEDA"],
    features: [
      "Data subject rights management",
      "Privacy by design principles",
      "Data processing agreements",
      "Privacy impact assessments"
    ]
  },
  {
    icon: Shield,
    title: "Security Standards",
    description: "Industry-leading security certifications and frameworks",
    standards: ["ISO 27001", "SOC 2 Type II", "NIST CSF"],
    features: [
      "Risk management framework",
      "Security awareness training",
      "Incident response procedures",
      "Business continuity planning"
    ]
  },
  {
    icon: Users,
    title: "Industry Compliance",
    description: "Sector-specific regulatory compliance",
    standards: ["HIPAA", "SOX", "PCI DSS", "FINRA"],
    features: [
      "Industry-specific controls",
      "Audit trail and logging",
      "Access management",
      "Data retention policies"
    ]
  },
  {
    icon: FileText,
    title: "Legal & Regulatory",
    description: "Adherence to global legal and regulatory requirements",
    standards: ["eIDAS", "ESIGN", "UETA", "E-Sign"],
    features: [
      "Electronic signatures",
      "Legal compliance monitoring",
      "Regulatory change management",
      "Compliance reporting"
    ]
  }
]

const certifications = [
  {
    name: "ISO 27001",
    description: "Information Security Management System",
    status: "Certified",
    date: "Valid until 2026",
    icon: Award
  },
  {
    name: "SOC 2 Type II",
    description: "Service Organization Control 2",
    status: "Certified",
    date: "Valid until 2025",
    icon: Award
  },
  {
    name: "GDPR",
    description: "General Data Protection Regulation",
    status: "Compliant",
    date: "Ongoing",
    icon: CheckCircle
  },
  {
    name: "CCPA",
    description: "California Consumer Privacy Act",
    status: "Compliant",
    date: "Ongoing",
    icon: CheckCircle
  },
  {
    name: "HIPAA",
    description: "Health Insurance Portability and Accountability Act",
    status: "Compliant",
    date: "Ongoing",
    icon: CheckCircle
  },
  {
    name: "PCI DSS",
    description: "Payment Card Industry Data Security Standard",
    status: "Compliant",
    date: "Valid until 2025",
    icon: CheckCircle
  }
]

const complianceProcess = [
  {
    step: "Assessment",
    description: "Regular risk assessments and gap analysis",
    icon: Shield
  },
  {
    step: "Implementation",
    description: "Deploy controls and remediation measures",
    icon: Lock
  },
  {
    step: "Monitoring",
    description: "Continuous monitoring and compliance tracking",
    icon: Users
  },
  {
    step: "Reporting",
    description: "Regular reporting and audit preparation",
    icon: FileText
  }
]

const complianceReports = [
  {
    title: "Annual Compliance Report",
    description: "Comprehensive overview of our compliance posture",
    type: "PDF",
    size: "2.5MB",
    date: "2024-11-01"
  },
  {
    title: "SOC 2 Type II Report",
    description: "Detailed security and availability controls",
    type: "PDF",
    size: "4.2MB",
    date: "2024-10-15",
    restricted: true
  },
  {
    title: "Data Processing Agreement",
    description: "Standard DPA for customer data processing",
    type: "PDF",
    size: "1.8MB",
    date: "2024-12-01"
  },
  {
    title: "GDPR Compliance Statement",
    description: "Detailed GDPR compliance documentation",
    type: "PDF",
    size: "3.1MB",
    date: "2024-11-20"
  }
]

export default function Compliance() {
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
            Compliance & Trust
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            We maintain comprehensive compliance with global regulations and industry standards to ensure your data is protected and your business meets its obligations.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="rounded-full">
              Download Compliance Docs
            </Button>
            <Button variant="outline" className="rounded-full">
              Request Audit Report
            </Button>
          </div>
        </div>
      </section>

      {/* Compliance Areas */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Compliance Framework
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {complianceAreas.map((area) => (
              <div key={area.title} className="bg-zinc-900 rounded-lg p-6">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <area.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {area.title}
                    </h3>
                    <p className="text-zinc-400">
                      {area.description}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Standards:</h4>
                  <div className="flex flex-wrap gap-2">
                    {area.standards.map((standard) => (
                      <span key={standard} className="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                        {standard}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {area.features.map((feature) => (
                      <li key={feature} className="text-zinc-400 text-sm flex items-start">
                        <CheckCircle className="w-3 h-3 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Certifications & Standards
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert) => (
              <div key={cert.name} className="bg-zinc-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {cert.name}
                  </h3>
                  <cert.icon className={`w-6 h-6 ${
                    cert.status === 'Certified' ? 'text-yellow-400' : 'text-green-400'
                  }`} />
                </div>
                
                <p className="text-zinc-400 text-sm mb-3">
                  {cert.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                    cert.status === 'Certified' 
                      ? 'bg-yellow-600/20 text-yellow-400' 
                      : 'bg-green-600/20 text-green-400'
                  }`}>
                    {cert.status}
                  </span>
                  <span className="text-zinc-400 text-xs">
                    {cert.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Process */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Our Compliance Process
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceProcess.map((process) => (
              <div key={process.step} className="bg-zinc-900 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <process.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {process.step}
                </h3>
                
                <p className="text-zinc-400 text-sm">
                  {process.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Reports */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Compliance Documentation
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {complianceReports.map((report) => (
              <div key={report.title} className="bg-zinc-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {report.title}
                    </h3>
                    <p className="text-zinc-400 text-sm mb-3">
                      {report.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <span>{report.type}</span>
                      <span>{report.size}</span>
                      <span>{new Date(report.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {report.restricted && (
                    <Lock className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full"
                  disabled={report.restricted}
                >
                  {report.restricted ? 'Request Access' : 'Download'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regional Compliance */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Regional Compliance
          </h2>
          
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Europe (GDPR)</h3>
              <p className="text-zinc-300 mb-4">
                Full compliance with the General Data Protection Regulation, including:
              </p>
              <ul className="space-y-2 text-zinc-400">
                <li>• Data subject rights fulfillment within 30 days</li>
                <li>• Privacy by design and by default implementation</li>
                <li>• Data Protection Officer (DPO) oversight</li>
                <li>• EU data residency options available</li>
              </ul>
            </div>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">United States (CCPA/CPRA)</h3>
              <p className="text-zinc-300 mb-4">
                Comprehensive compliance with California privacy laws and other state regulations:
              </p>
              <ul className="space-y-2 text-zinc-400">
                <li>• Consumer rights to know, delete, and opt-out</li>
                <li>• Do Not Sell or Share implementation</li>
                <li>• Privacy notice transparency</li>
                <li>• Data breach notification procedures</li>
              </ul>
            </div>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Global Coverage</h3>
              <p className="text-zinc-300 mb-4">
                Additional compliance with international regulations:
              </p>
              <ul className="space-y-2 text-zinc-400">
                <li>• Canada (PIPEDA)</li>
                <li>• Brazil (LGPD)</li>
                <li>• Australia (Privacy Act)</li>
                <li>• Singapore (PDPA)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Third-Party Audits */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Independent Audits
          </h2>
          <p className="text-zinc-400 mb-8">
            Our compliance is verified through regular independent audits and assessments.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-zinc-800 rounded-lg p-6">
              <Award className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Annual Audits
              </h3>
              <p className="text-zinc-400 text-sm">
                Comprehensive annual audits by certified third-party assessors
              </p>
            </div>
            
            <div className="bg-zinc-800 rounded-lg p-6">
              <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Penetration Testing
              </h3>
              <p className="text-zinc-400 text-sm">
                Regular security testing by independent cybersecurity firms
              </p>
            </div>
            
            <div className="bg-zinc-800 rounded-lg p-6">
              <FileText className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Continuous Monitoring
              </h3>
              <p className="text-zinc-400 text-sm">
                Ongoing compliance monitoring and automated controls
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Compliance Team */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Compliance Questions?
          </h2>
          <p className="text-zinc-400 mb-8">
            Our compliance team is here to help with any questions about our regulatory adherence and certifications.
          </p>
          
          <div className="bg-zinc-900 rounded-lg p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  General Inquiries
                </h3>
                <p className="text-zinc-300">
                  compliance@kits-hub.com
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Data Protection Officer
                </h3>
                <p className="text-zinc-300">
                  dpo@kits-hub.com
                </p>
              </div>
            </div>
          </div>
          
          <Button className="rounded-full">
            Schedule Compliance Review
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
