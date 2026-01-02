"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Menu, Search, LogIn } from 'lucide-react'
import { LiquidCtaButton } from "@/components/buttons/liquid-cta-button"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image 
              src="/kits-logo.png" 
              alt="KiTS Hub" 
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="hidden font-bold sm:inline-block text-xl">
              KiTS Hub
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <div className="relative group">
              <button className="flex items-center space-x-1 hover:text-foreground/80 transition-colors">
                <span>Products</span>
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-popover border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-2">
                  <Link href="/crm" className="block px-3 py-2 text-sm hover:bg-accent rounded-md">CRM</Link>
                  <Link href="/pos" className="block px-3 py-2 text-sm hover:bg-accent rounded-md">Point of Sale</Link>
                  <Link href="/hr" className="block px-3 py-2 text-sm hover:bg-accent rounded-md">HR Management</Link>
                  <Link href="/accounting" className="block px-3 py-2 text-sm hover:bg-accent rounded-md">Accounting</Link>
                  <Link href="/analytics" className="block px-3 py-2 text-sm hover:bg-accent rounded-md">Analytics</Link>
                </div>
              </div>
            </div>
            <div className="relative group">
              <button className="flex items-center space-x-1 hover:text-foreground/80 transition-colors">
                <span>Resources</span>
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-popover border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-2">
                  <Link href="/blog" className="block px-3 py-2 text-sm hover:bg-accent rounded-md">Blog</Link>
                  <Link href="/docs" className="block px-3 py-2 text-sm hover:bg-accent rounded-md">Documentation</Link>
                  <Link href="/tutorials" className="block px-3 py-2 text-sm hover:bg-accent rounded-md">Tutorials</Link>
                  <Link href="/webinars" className="block px-3 py-2 text-sm hover:bg-accent rounded-md">Webinars</Link>
                  <Link href="/community" className="block px-3 py-2 text-sm hover:bg-accent rounded-md">Community</Link>
                </div>
              </div>
            </div>
            <Link
              href="/pricing"
              className="hover:text-foreground/80 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="hover:text-foreground/80 transition-colors"
            >
              About
            </Link>
          </nav>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
          <nav className="flex items-center">
            <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-1">
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Button>
            <div className="hidden md:flex">
              <LiquidCtaButton theme="dark">
                Get Started Free
              </LiquidCtaButton>
            </div>
          </nav>
        </div>

        <Button
          variant="ghost"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 py-2 px-0 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="absolute top-14 left-0 right-0 z-50 p-6 shadow-md animate-in slide-in-from-top-80 md:hidden">
          <div className="relative z-20 grid gap-6 rounded-md bg-popover p-4 text-popover-foreground shadow-md">
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src="/kits-logo.png" 
                alt="KiTS Hub" 
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="font-bold">KiTS Hub</span>
            </Link>
            <nav className="grid grid-flow-row auto-rows-max text-sm">
              <Link
                href="/crm"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                CRM
              </Link>
              <Link
                href="/pos"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Point of Sale
              </Link>
              <Link
                href="/hr"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                HR Management
              </Link>
              <Link
                href="/accounting"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Accounting
              </Link>
              <Link
                href="/analytics"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Analytics
              </Link>
              <Link
                href="/blog"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Blog
              </Link>
              <Link
                href="/docs"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Documentation
              </Link>
              <Link
                href="/tutorials"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Tutorials
              </Link>
              <Link
                href="/webinars"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Webinars
              </Link>
              <Link
                href="/community"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Community
              </Link>
              <Link
                href="/pricing"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Contact
              </Link>
              <Link
                href="/careers"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Careers
              </Link>
              <Link
                href="/press"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Press
              </Link>
              <Link
                href="/partners"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Partners
              </Link>
              <Link
                href="/privacy"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Cookie Policy
              </Link>
              <Link
                href="/security"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Security
              </Link>
              <Link
                href="/compliance"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Compliance
              </Link>
              <Link
                href="#"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Login
              </Link>
            </nav>
            <div className="w-full">
              <LiquidCtaButton theme="dark">
                Get Started Free
              </LiquidCtaButton>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
