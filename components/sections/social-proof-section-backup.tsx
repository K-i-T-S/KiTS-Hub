"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'framer-motion'
import '@/components/sections/zero-explosion.css'

export default function SocialProofSection() {
  const [counters, setCounters] = useState({
    customers: 999,
    rating: 4.9,
    countries: 150,
    uptime: 99.9
  })
  
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentZeros, setCurrentZeros] = useState<number | string>(999)
  const [explosionOccurred, setExplosionOccurred] = useState(false)
  const [explosionCount, setExplosionCount] = useState(0)
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([])
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const createExplosion = useCallback(() => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 1000)
  }, [])

  const resetZeroAnimation = useCallback(() => {
    if (explosionCount >= 3) return
    
    setIsAnimating(true)
    setExplosionOccurred(false)
    setCurrentZeros(0)
    createExplosion()
    
    let count = 0
    const interval = setInterval(() => {
      count += Math.floor(Math.random() * 50) + 100
      if (count >= 999) {
        setCurrentZeros(999)
        clearInterval(interval)
        setTimeout(() => {
          setIsAnimating(false)
          setExplosionOccurred(true)
          setExplosionCount(prev => prev + 1)
          createExplosion()
        }, 500)
      } else {
        setCurrentZeros(count)
      }
    }, 50)
  }, [explosionCount, createExplosion])

  useEffect(() => {
    if (isInView && !isAnimating) {
      const timer = setTimeout(() => {
        setCounters({
          customers: 999,
          rating: 4.9,
          countries: 150,
          uptime: 99.9
        })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isInView, isAnimating])

  useEffect(() => {
    if (explosionCount >= 3) {
      resetZeroAnimation()
      setCurrentZeros("Join Us")
      setIsAnimating(false)
      setExplosionOccurred(true)
    }
  }, [explosionCount, resetZeroAnimation])

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      {/* Background with subtle gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95"
        style={{
          backgroundImage: `
            linear-gradient(90deg, var(--purple-950) 1px, transparent 1px),
            linear-gradient(0deg, var(--purple-950) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'perspective(1000px) rotateX(2deg)'
        }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="space-y-4 flex flex-col items-center group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -12 }}
          >
            <motion.div 
              id="customer-counter" 
              className="relative overflow-hidden"
              onClick={explosionCount >= 3 ? undefined : resetZeroAnimation}
              whileHover={{ 
                scale: 1.05,
                rotate: [0, -2, 2, 0],
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Animated gradient border with morphing effect */}
              <motion.div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                  background: 'linear-gradient(45deg, rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.3), rgba(168, 85, 247, 0.3))'
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Premium glassmorphic card */}
              <div className="relative bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-2xl border border-border/30 rounded-2xl px-10 py-6 shadow-2xl shadow-purple-500/20 hover:shadow-3xl hover:shadow-purple-500/30 transition-all duration-500">
                {/* Animated background particles */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  <motion.div 
                    className="absolute w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
                    animate={{
                      x: [0, 20, 0],
                      y: [0, -20, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{ top: '20%', left: '60%' }}
                  />
                  <motion.div 
                    className="absolute w-24 h-24 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-2xl"
                    animate={{
                      x: [0, -15, 0],
                      y: [0, 15, 0],
                      scale: [1.1, 0.9, 1.1]
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{ top: '60%', left: '10%' }}
                  />
                </div>
                
                {/* Subtle grid pattern overlay */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-5"
                  style={{
                    backgroundImage: `
                      linear-gradient(90deg, var(--purple-400) 1px, transparent 1px),
                      linear-gradient(0deg, var(--purple-400) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                />
                
                <motion.div className="relative flex items-center justify-center min-h-[56px]">
                  {/* Enhanced Join Us Badge Design */}
                  {typeof currentZeros === 'string' && currentZeros.length > 3 ? (
                    <motion.div 
                      className="relative"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 200, 
                        damping: 20,
                        duration: 0.8 
                      }}
                    >
                      {/* Animated badge background */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl"
                        animate={{
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{
                          filter: 'blur(8px)',
                          opacity: 0.7
                        }}
                      />
                      
                      {/* Main badge container */}
                      <motion.div 
                        className="relative bg-gradient-to-br from-purple-600/90 to-pink-600/90 backdrop-blur-xl border border-white/20 rounded-2xl px-8 py-4 shadow-2xl"
                        whileHover={{ 
                          scale: 1.1,
                          rotate: [0, -5, 5, 0]
                        }}
                        animate={{
                          y: [0, -3, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {/* Sparkle effects */}
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full"
                            style={{
                              top: `${20 + Math.sin(i * 60) * 15}%`,
                              left: `${10 + (i * 15)}%`
                            }}
                            animate={{
                              scale: [0, 1, 0],
                              opacity: [0, 1, 0],
                              rotate: [0, 180]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.3,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                        
                        {/* Text content */}
                        <div className="relative flex items-center gap-3">
                          <motion.div
                            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                            animate={{
                              rotate: [0, 360]
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                          >
                            <span className="text-white text-lg font-bold">✨</span>
                          </motion.div>
                          
                          <motion.span 
                            className="text-white font-bold text-2xl"
                            style={{
                              textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(168, 85, 247, 0.6)',
                              fontWeight: '800',
                              letterSpacing: '0.08em'
                            }}
                            animate={{
                              textShadow: [
                                '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(168, 85, 247, 0.6)',
                                '0 0 25px rgba(255, 255, 255, 1), 0 0 50px rgba(236, 72, 153, 0.8)',
                                '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(168, 85, 247, 0.6)'
                              ]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            {currentZeros}
                          </motion.span>
                          
                          <motion.div
                            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                            animate={{
                              rotate: [0, -360]
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                          >
                            <span className="text-white text-lg font-bold">🚀</span>
                          </motion.div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ) : (
                    /* Original number display */
                    <motion.span 
                      className="font-black relative"
                      style={{
                        fontSize: isAnimating && typeof currentZeros === 'number' ? `${Math.min(1.6 + (currentZeros / 999 * 1.4), 3.2)}rem` : '2.4rem',
                        transition: 'font-size 0.02s ease',
                        display: 'inline-block',
                        transform: 'translateX(0%)',
                        maxWidth: '100%',
                        overflow: 'visible',
                        whiteSpace: typeof currentZeros === 'string' ? 'normal' : 'nowrap',
                        background: typeof currentZeros === 'string' 
                          ? 'linear-gradient(135deg, #a855f7, #ec4899, #a855f7)'
                          : 'linear-gradient(135deg, #a855f7, #ec4899)',
                        WebkitBackgroundClip: typeof currentZeros === 'string' && currentZeros.length <= 3 ? 'text' : 'border-box',
                        WebkitTextFillColor: typeof currentZeros === 'string' && currentZeros.length <= 3 ? 'transparent' : '#ffffff',
                        color: typeof currentZeros === 'string' && currentZeros.length <= 3 ? 'transparent' : '#ffffff',
                        textShadow: typeof currentZeros === 'string' && currentZeros.length > 3 ? '0 0 20px rgba(168, 85, 247, 0.8), 0 0 40px rgba(236, 72, 153, 0.6)' : 'none',
                        fontWeight: typeof currentZeros === 'string' && currentZeros.length > 3 ? '800' : '900',
                        letterSpacing: typeof currentZeros === 'string' && currentZeros.length > 3 ? '0.05em' : 'normal',
                        filter: typeof currentZeros === 'string' ? 'drop-shadow(0 0 30px rgba(168, 85, 247, 0.5))' : 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.3))'
                      }}
                      animate={{
                        backgroundPosition: typeof currentZeros === 'string' ? ['0% 50%', '100% 50%', '0% 50%'] : ['0% 50%', '50% 50%', '100% 50%', '50% 50%', '0% 50%'],
                        transform: typeof currentZeros === 'string' 
                          ? ['scale(1)', 'scale(1.05)', 'scale(1)']
                          : ['scale(1)', 'scale(1.02)', 'scale(1)']
                      }}
                      transition={{
                        duration: typeof currentZeros === 'string' ? 3 : 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {isAnimating ? currentZeros : ((explosionCount >= 3 && typeof currentZeros === 'string') ? currentZeros : (explosionOccurred ? '💥' : '999'))}
                    </motion.span>
                  )}
                </motion.div>
              </div>
            </motion.div>
            
            {/* Enhanced label with icon */}
            <motion.div 
              className="relative inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-muted/60 to-muted/40 backdrop-blur-md border border-border/40 text-sm font-semibold text-muted-foreground group-hover:text-foreground group-hover:from-purple-500/10 group-hover:to-pink-500/10 group-hover:border-purple-500/30 transition-all duration-500 shadow-lg shadow-purple-500/5 group-hover:shadow-purple-500/20"
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated icon */}
              <motion.div 
                className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-60 group-hover:opacity-100"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <span className="relative z-10">Customers</span>
              {/* Animated underline */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full"
                initial={{ scaleX: 0, opacity: 0 }}
                whileHover={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="space-y-4 flex flex-col items-center group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -12 }}
          >
            <motion.div 
              className="relative overflow-hidden group"
              whileHover={{ 
                scale: 1.05,
                rotate: [0, -2, 2, 0],
              }}
            >
              <div className="relative bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-2xl border border-border/30 rounded-2xl px-10 py-6 shadow-2xl shadow-amber-500/20 hover:shadow-3xl hover:shadow-amber-500/30 transition-all duration-500">
                <motion.div className="relative flex items-center justify-center min-h-[56px]">
                  <div className="flex items-baseline gap-2">
                    <motion.span
                      className="font-black relative"
                      style={{
                        fontSize: '2.4rem',
                        background: 'linear-gradient(135deg, #fbbf24, #fb923c)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        color: 'transparent',
                        filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.3))'
                      }}
                      animate={{
                        backgroundPosition: ['0% 50%', '50% 50%', '100% 50%', '50% 50%', '0% 50%'],
                        transform: ['scale(1)', 'scale(1.02)', 'scale(1)']
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {counters.rating}
                    </motion.span>
                    <motion.span
                      className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      ★
                    </motion.span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            <motion.div 
              className="relative inline-flex items-center px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm border border-border/30 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <span className="relative z-10">Rating</span>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="space-y-4 flex flex-col items-center group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -12 }}
          >
            <motion.div 
              className="relative overflow-hidden group"
              whileHover={{ 
                scale: 1.05,
                rotate: [0, -2, 2, 0],
              }}
            >
              <div className="relative bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-2xl border border-border/30 rounded-2xl px-10 py-6 shadow-2xl shadow-emerald-500/20 hover:shadow-3xl hover:shadow-emerald-500/30 transition-all duration-500">
                <motion.div className="relative flex items-center justify-center min-h-[56px]">
                  <div className="flex items-baseline gap-1">
                    <motion.span
                      className="font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent"
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)']
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {counters.countries}
                    </motion.span>
                    <motion.span
                      className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      +
                    </motion.span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            <motion.div 
              className="relative inline-flex items-center px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm border border-border/30 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <span className="relative z-10">Countries</span>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="space-y-4 flex flex-col items-center group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ y: -12 }}
          >
            <motion.div 
              className="relative overflow-hidden group"
              whileHover={{ 
                scale: 1.05,
                rotate: [0, -2, 2, 0],
              }}
            >
              <div className="relative bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-2xl border border-border/30 rounded-2xl px-10 py-6 shadow-2xl shadow-blue-500/20 hover:shadow-3xl hover:shadow-blue-500/30 transition-all duration-500">
                <motion.div className="relative flex items-center justify-center min-h-[56px]">
                  <div className="flex items-baseline gap-1">
                    <motion.span
                      className="font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)']
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {counters.uptime}
                    </motion.span>
                    <motion.span
                      className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.8, 1, 0.8]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      %
                    </motion.span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            <motion.div 
              className="relative inline-flex items-center px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm border border-border/30 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <span className="relative z-10">Uptime</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
