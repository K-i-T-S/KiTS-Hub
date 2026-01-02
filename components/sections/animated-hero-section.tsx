"use client"

import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useMemo, useEffect, useState } from "react"
import { LiquidCtaButton } from "@/components/buttons/liquid-cta-button"

// Helper function to generate deterministic random particles
const generateParticles = (seed: number) => {
  // Simple seeded random number generator
  const random = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }
  
  return [...Array(20)].map((_, i) => ({
    id: i,
    left: random(seed + i) * 100,
    top: random(seed + i + 100) * 100,
    duration: 3 + random(seed + i + 200) * 2,
    delay: random(seed + i + 300) * 2
  }))
}

export function AnimatedHeroSection() {
  const [isClient, setIsClient] = useState(false)
  
  // Generate particles only on client side to avoid hydration mismatch
  const particles = useMemo(() => {
    if (!isClient) return []
    return generateParticles(12345) // Use fixed seed for consistency
  }, [isClient])

  useEffect(() => {
    // Use requestAnimationFrame to avoid synchronous setState
    const rafId = requestAnimationFrame(() => {
      setIsClient(true)
    })
    return () => cancelAnimationFrame(rafId)
  }, [])
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 relative overflow-hidden">
      {/* Animated background gradient */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 via-transparent to-transparent"
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-gradient-to-r from-[#a855f7] to-[#9333ea] rounded-full opacity-60 shadow-lg shadow-purple-500/30"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <motion.div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Sparkles className="w-4 h-4 text-zinc-400" />
          </motion.div>
          <span className="text-sm text-zinc-400">KiTS-TheSolutionsHub</span>
        </motion.div>

        <motion.h1 
          className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.span 
            className="text-zinc-100 block"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            All The Solutions
          </motion.span>
          <motion.span 
            className="bg-gradient-to-r from-zinc-500 via-zinc-300 to-zinc-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Managed In One Place.
          </motion.span>
        </motion.h1>

        <motion.p 
          className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed text-balance"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          The complete business management platform combining CRM, POS, inventory, HR, accounting, and more. Everything
          your business needs to thrive, in one powerful SolutionsHub.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link href="#pricing">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LiquidCtaButton theme="dark">
                Start Free Trial
              </LiquidCtaButton>
            </motion.div>
          </Link>
          <Link
            href="#features"
            className="group flex items-center gap-2 px-6 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <span>See how it works</span>
            <motion.div
              animate={{ x: 0 }}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </motion.div>

        {/* Social Proof */}
        <motion.div 
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center z-[1]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.9 + i * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <svg
                    className="w-6 h-6 text-zinc-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </motion.div>
              ))}
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="flex flex-col items-start">
              <motion.div 
                className="flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="#FACC15"
                    stroke="#FACC15"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.3, delay: 1.5 + i * 0.05 }}
                  >
                    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                  </motion.svg>
                ))}
                <span className="text-zinc-400 font-medium ml-1 text-sm">5.0</span>
              </motion.div>
              <motion.p 
                className="text-sm text-zinc-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.8 }}
              >
                Trusted by <span className="text-zinc-300 font-medium">Local and International</span> businesses
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
