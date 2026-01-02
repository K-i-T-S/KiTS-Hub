"use client"

import { useState } from 'react'
import { ArrowRight } from "lucide-react"
import { LiquidCtaButton } from "@/components/buttons/liquid-cta-button"

export function CtaSection() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle email submission
    console.log('Email submitted:', email)
  }

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Advanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2e0f38] via-[#4a0e4e] to-[#551a8b]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#8f00ff]/20 via-transparent to-[#a855f7]/20" />
      
      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.3)_0%,rgba(107,33,168,0.1)_50%,transparent_100%)]" />
      
      {/* Animated gradient shimmer effect */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(168,85,247,0.6)] to-transparent animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[rgba(147,51,234,0.4)] to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[rgba(168,85,247,0.3)] to-transparent animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
            Ready to grow better?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that are already using KiTS Hub to streamline their operations and accelerate growth.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              required
            />
            <LiquidCtaButton 
              theme="light"
              onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            >
              Get Started
            </LiquidCtaButton>
          </form>
          
          <p className="text-sm text-white/80">
            Get started free. No credit card required.
          </p>
        </div>
      </div>
    </section>
  )
}
