import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Mail, Phone, MessageCircle } from 'lucide-react'

const footerLinks = {
  products: [
    { name: 'CRM', href: '/crm' },
    { name: 'Point of Sale', href: '/pos' },
    { name: 'HR Management', href: '/hr' },
    { name: 'Accounting', href: '/accounting' },
    { name: 'Analytics', href: '/analytics' }
  ],
  resources: [
    { name: 'Blog', href: '/blog' },
    { name: 'Documentation', href: '/docs' },
    { name: 'Tutorials', href: '/tutorials' },
    { name: 'Webinars', href: '/webinars' },
    { name: 'Community', href: '/community' }
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Partners', href: '/partners' },
    { name: 'Contact', href: '/contact' }
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Security', href: '/security' },
    { name: 'Compliance', href: '/compliance' }
  ]
}

const socialLinks = [
  { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61585989414621', label: 'Facebook' },
  { icon: Instagram, href: 'https://www.instagram.com/kits_solutions', label: 'Instagram' }
]

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo and tagline */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <div className="flex items-center space-x-2">
                <Image 
                  src="/kits-logo.png" 
                  alt="KiTS Hub" 
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-2xl font-bold">KiTS Hub</span>
              </div>
            </Link>
            <p className="text-zinc-400 mb-6 max-w-sm">
              The complete business management platform for modern companies. Everything you need to thrive, all in one place.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-zinc-400 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-zinc-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-zinc-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-zinc-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <a href="mailto:kits.tech.co@gmail.com" className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors text-sm">
                <Mail className="w-4 h-4" />
                <span>kits.tech.co@gmail.com</span>
              </a>
              <a href="tel:+9681290662" className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors text-sm">
                <Phone className="w-4 h-4" />
                <span>+961 81 290 662</span>
              </a>
              <a href="https://wa.me/message/FOTDUBM6EP2IO1" className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors text-sm">
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-zinc-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-zinc-400 text-sm mb-4 md:mb-0">
            © 2025 KiTS Hub. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/cookies" className="text-zinc-400 hover:text-white transition-colors">
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
