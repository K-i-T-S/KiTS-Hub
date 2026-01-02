"use client"

import React, { useState } from 'react'
import Link from 'next/link'
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
            <span className="hidden font-bold sm:inline-block text-xl">
              KiTS Hub
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <div className="relative group">
              <button className="flex items-center space-x-1 hover:text-foreground/80 transition-colors">
                <span>Products</span>
              </button>
              {/* Dropdown menu would go here */}
            </div>
            <div className="relative group">
              <button className="flex items-center space-x-1 hover:text-foreground/80 transition-colors">
                <span>Resources</span>
              </button>
              {/* Dropdown menu would go here */}
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
        <div className="fixed inset-0 top-14 z-50 grid w-full grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-top-80 md:hidden">
          <div className="relative z-20 grid gap-6 rounded-md bg-popover p-4 text-popover-foreground shadow-md">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold">KiTS Hub</span>
            </Link>
            <nav className="grid grid-flow-row auto-rows-max text-sm">
              <Link
                href="#"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Products
              </Link>
              <Link
                href="#"
                className="flex w-full items-center justify-between py-2 font-medium"
              >
                Resources
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
