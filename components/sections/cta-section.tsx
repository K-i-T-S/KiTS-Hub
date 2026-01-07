"use client"

import { useState } from 'react'
import { LiquidCtaButton } from "@/components/buttons/liquid-cta-button"
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export function CtaSection() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Navigate to onboarding with email pre-filled
    router.push(`/onboarding?email=${encodeURIComponent(email)}`)
  }

  const handleGetStarted = () => {
    // Navigate directly to onboarding
    router.push('/onboarding')
  }

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Advanced radial gradient overlay from MotionDOMComponent */}
      <motion.div 
        className="absolute inset-0 opacity-30" 
        style={{background: "radial-gradient(circle at 35.2527% 34.7473%, rgba(167, 116, 249, 0.3) 0%, transparent 50%)"}}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Additional animated gradient layers */}
      <motion.div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.3) 20%, rgba(255, 255, 255, 0.2) 40%, transparent 70%)"
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Glow effect overlay */}
      <motion.div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)"
        }}
        animate={{
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white"
            animate={{
              textShadow: [
                "0 0 20px rgba(255, 255, 255, 0.5)",
                "0 0 30px rgba(167, 116, 249, 0.8)",
                "0 0 20px rgba(255, 255, 255, 0.5)"
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Ready to grow better?
          </motion.h2>
          <motion.p 
            className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
            animate={{
              opacity: [0.9, 1, 0.9]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Join thousands of businesses that are already using KiTS Hub to streamline their operations and accelerate growth.
          </motion.p>
          
          <motion.form 
            onSubmit={handleSubmit} 
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              required
              whileFocus={{
                scale: 1.05,
                boxShadow: "0 0 20px rgba(167, 116, 249, 0.5)"
              }}
              transition={{ duration: 0.2 }}
            />
            <LiquidCtaButton 
              theme="light"
              onClick={handleGetStarted}
            >
              Get Started
            </LiquidCtaButton>
          </motion.form>
          
          <motion.p 
            className="text-sm text-white/80"
            animate={{
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Get started free. No credit card required.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
