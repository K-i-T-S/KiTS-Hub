"use client"

import { motion } from "framer-motion"
import { Sparkles, Infinity, Zap, Star, Rocket, ArrowRight, Plus } from "lucide-react"
import { useState, useEffect } from "react"

interface FloatingIcon {
  id: number
  icon: React.ComponentType<{ className?: string }>
  x: number
  y: number
  delay: number
  duration: number
  scale: number
}

const floatingIcons: FloatingIcon[] = [
  { id: 1, icon: Sparkles, x: 10, y: 20, delay: 0, duration: 4, scale: 0.8 },
  { id: 2, icon: Infinity, x: 85, y: 15, delay: 0.5, duration: 5, scale: 1 },
  { id: 3, icon: Zap, x: 15, y: 70, delay: 1, duration: 3.5, scale: 0.9 },
  { id: 4, icon: Star, x: 80, y: 75, delay: 1.5, duration: 4.5, scale: 0.7 },
  { id: 5, icon: Rocket, x: 50, y: 10, delay: 2, duration: 6, scale: 0.85 },
  { id: 6, icon: Plus, x: 25, y: 45, delay: 2.5, duration: 3.8, scale: 0.6 },
  { id: 7, icon: Sparkles, x: 75, y: 40, delay: 3, duration: 4.2, scale: 0.75 },
  { id: 8, icon: Infinity, x: 45, y: 80, delay: 3.5, duration: 5.5, scale: 0.9 },
]

const featuresList = [
  "AI-Powered Insights",
  "Advanced Analytics", 
  "Custom Workflows",
  "API Integrations",
  "Mobile Apps",
  "24/7 Support"
]

export function AndMuchMoreBanner() {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % featuresList.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-zinc-900/50 to-indigo-900/20" />
      
      {/* Mesh gradient overlay */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 20%, rgba(167, 139, 250, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)",
          ]
        }}
        transition={{
          duration: 8,
          repeat: Number.MAX_SAFE_INTEGER,
          ease: "easeInOut"
        }}
      />

      {/* Floating icons background */}
      {floatingIcons.map((icon) => (
        <motion.div
          key={icon.id}
          className="absolute opacity-20"
          style={{
            left: `${icon.x}%`,
            top: `${icon.y}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 4,
            delay: icon.id * 0.5,
            repeat: Number.MAX_SAFE_INTEGER,
            ease: "easeInOut"
          }}
        >
          <motion.div
            style={{
              transform: `scale(${icon.scale})`,
            }}
          >
            <icon.icon className="w-6 h-6 text-purple-400" />
          </motion.div>
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-6">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Pre-heading */}
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 backdrop-blur-sm mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="animate-spin">
              <Infinity className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-sm text-purple-300 font-medium">Endless Possibilities</span>
          </motion.div>

          {/* Main heading with animated text */}
          <div className="mb-8">
            <motion.h2 
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="text-zinc-100">And Much</span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent ml-3 animate-pulse">
                More
              </span>
            </motion.h2>

            {/* Animated feature list */}
            <motion.div 
              className="h-8 flex items-center justify-center mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  key={currentFeatureIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span className="text-xl text-zinc-300 font-medium">
                    {featuresList[currentFeatureIndex]}
                  </span>
                </motion.div>
              </div>
            </motion.div>

            {/* Subheading */}
            <motion.p 
              className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <span className="text-zinc-300">More always coming on the way</span>
              <span className="text-zinc-400"> — We're constantly innovating and adding new features to help your business thrive.</span>
            </motion.p>
          </div>

          {/* Interactive CTA */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <motion.button
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              {/* Animated background overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"
                initial={{ x: "100%" }}
                animate={{ x: isHovered ? "0%" : "100%" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
              
              <div className="relative z-10 flex items-center gap-2">
              <Rocket className="w-5 h-5" />
                <span>Explore All Features</span>
                <motion.div
                  animate={{ x: isHovered ? 4 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </div>
            </motion.button>

            <motion.button
              className="px-8 py-4 border border-purple-500/30 text-purple-300 font-medium rounded-xl hover:bg-purple-500/10 transition-all duration-300 backdrop-blur-sm"
              whileHover={{ scale: 1.05, borderColor: "rgba(168, 85, 247, 0.5)" }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Request Feature</span>
              </div>
            </motion.button>
          </motion.div>

          {/* Feature dots indicator */}
          <motion.div 
            className="flex justify-center gap-2 mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            {featuresList.map((_, index) => (
              <motion.div
                key={index}
                className="w-2 h-2 rounded-full bg-purple-500/30"
                animate={{
                  scale: index === currentFeatureIndex ? 1.5 : 1,
                  backgroundColor: index === currentFeatureIndex ? "rgb(168, 85, 247)" : "rgba(168, 85, 247, 0.3)",
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
    </section>
  )
}
