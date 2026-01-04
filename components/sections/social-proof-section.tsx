"use client"

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import './zero-explosion.css'

export function SocialProofSection() {
  const [counters, setCounters] = useState({
    customers: 0,
    rating: 0,
    countries: 0,
    uptime: 0
  })
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Zero explosion animation states
  const [currentZeros, setCurrentZeros] = useState<number | string>(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [explosionOccurred, setExplosionOccurred] = useState(false)
  const [initialExplosionDone, setInitialExplosionDone] = useState(false)
  const [explosionCount, setExplosionCount] = useState(0)
  const zeroAnimationRef = useRef<number | null>(null)

  const createExplosionParticle = (x: number, y: number) => {
    const particle = document.createElement('div')
    particle.className = 'zero-particle'
    
    // Add variety to particles - now numbers up to 999 and symbols
    const particleTypes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '99', '999', '💫', '✨', '⭐', '💥', '🔥', '⚡', '💢']
    particle.textContent = particleTypes[Math.floor(Math.random() * particleTypes.length)]
    
    const angle = Math.random() * Math.PI * 2
    const distance = 300 + Math.random() * 500 // Much larger distance (300-800px)
    const tx = Math.cos(angle) * distance
    const ty = Math.sin(angle) * distance
    
    particle.style.setProperty('--tx', `${tx}px`)
    particle.style.setProperty('--ty', `${ty}px`)
    particle.style.left = `${x}px`
    particle.style.top = `${y}px`
    
    // Randomize particle size and animation duration
    const scale = 0.6 + Math.random() * 1.2 // Larger size range (0.6-1.8)
    const duration = 3 + Math.random() * 2 // Longer duration (3-5 seconds)
    particle.style.fontSize = `${1.2 + Math.random() * 1.2}rem` // Larger font range
    particle.style.animationDuration = `${duration}s`
    particle.style.transform = `scale(${scale})`
    
    document.body.appendChild(particle)
    
    setTimeout(() => {
      particle.remove()
    }, duration * 1000)
  }

  const createExplosion = () => {
    const customerElement = document.getElementById('customer-counter')
    if (customerElement) {
      const rect = customerElement.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      // Add exploding class to the box
      customerElement.classList.add('exploding')
      
      // Create shockwave effect
      const shockwave = document.createElement('div')
      shockwave.className = 'shockwave'
      customerElement.appendChild(shockwave)
      
      // Create exploding number effect
      const explodingNumber = document.createElement('div')
      explodingNumber.className = 'exploding-number'
      explodingNumber.textContent = currentZeros.toString() || '999'
      explodingNumber.style.left = '50%'
      explodingNumber.style.top = '50%'
      explodingNumber.style.transform = 'translate(-50%, -50%)'
      customerElement.appendChild(explodingNumber)
      
      // Create the main flash
      const flash = document.createElement('div')
      flash.className = 'explosion-flash'
      document.body.appendChild(flash)
      
      // Create more particles for dramatic effect
      const particleCount = 80
      for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
          createExplosionParticle(centerX, centerY)
        }, i * 5)
      }
      
      // Create secondary burst after initial explosion
      setTimeout(() => {
        for (let i = 0; i < 40; i++) {
          setTimeout(() => {
            createExplosionParticle(centerX + (Math.random() - 0.5) * 100, centerY + (Math.random() - 0.5) * 100)
          }, i * 3)
        }
      }, 200)
      
      // Create tertiary burst for even more impact
      setTimeout(() => {
        for (let i = 0; i < 30; i++) {
          setTimeout(() => {
            createExplosionParticle(centerX + (Math.random() - 0.5) * 150, centerY + (Math.random() - 0.5) * 150)
          }, i * 2)
        }
      }, 400)
    }
    
    setTimeout(() => {
      // Clean up all explosion effects
      const shockwave = document.querySelector('.shockwave')
      const explodingNumber = document.querySelector('.exploding-number')
      shockwave?.remove()
      explodingNumber?.remove()
      
      const flash = document.querySelector('.explosion-flash')
      flash?.remove()
      
      // Always increment explosion count using functional update
      setExplosionCount(prev => {
        const newCount = prev + 1
        
        // Check if we've reached 3 explosions
        if (newCount >= 3) {
          // Become static at 999 with special message
          resetZeroAnimation()
          setCurrentZeros("Join-Us!")
          setIsAnimating(false)
          setExplosionOccurred(true)
        } else {
          // Normal explosion reset and restart
          resetZeroAnimation()
          setTimeout(() => {
            startZeroAnimation()
          }, 2000)
        }
        return newCount
      })
    }, 3000)
  }

  const animateZeros = () => {
    if (!isAnimating) return
    
    setCurrentZeros(prev => {
      // Only animate if prev is a number
      if (typeof prev !== 'number') return prev
      
      const newZeros = prev + 1
      
      if (newZeros >= 4 && newZeros < 6) {
        const element = document.getElementById('customer-counter')
        element?.classList.add('warning')
        element?.classList.remove('danger')
      } else if (newZeros >= 6 && newZeros < 8) {
        const element = document.getElementById('customer-counter')
        element?.classList.add('danger')
        element?.classList.remove('warning')
      } else if (newZeros >= 8) {
        createExplosion()
        return prev
      } else {
        const element = document.getElementById('customer-counter')
        element?.classList.remove('warning', 'danger')
      }
      
      return newZeros
    })
    
    // Continue animation if not exploded
    if (typeof currentZeros === 'number' && currentZeros < 8) {
      zeroAnimationRef.current = requestAnimationFrame(() => {
        setTimeout(animateZeros, 600)
      })
    }
  }

  const startZeroAnimation = () => {
    // Don't start if we've already had 3 explosions
    if (explosionCount >= 3) {
      return
    }
    
    if (isAnimating) return
    setIsAnimating(true)
    setExplosionOccurred(false)
    setCurrentZeros(1) // Start with 1
    
    // Rapid counting from 1 to 999
    let count = 1
    const interval = setInterval(() => {
      count++
      if (count <= 999) {
        setCurrentZeros(count)
        
        // Warning states based on progress
        const progress = count / 999
        if (progress >= 0.7 && progress < 0.85) {
          const element = document.getElementById('customer-counter')
          element?.classList.add('warning')
          element?.classList.remove('danger')
        } else if (progress >= 0.85) {
          const element = document.getElementById('customer-counter')
          element?.classList.add('danger')
          element?.classList.remove('warning')
        } else {
          const element = document.getElementById('customer-counter')
          element?.classList.remove('warning', 'danger')
        }
      } else {
        clearInterval(interval)
        createExplosion()
      }
    }, 5) // Ultra-fast counting (5ms per number = 200 numbers per second)
    
    zeroAnimationRef.current = interval as any
  }

  const resetZeroAnimation = () => {
    setIsAnimating(false)
    setCurrentZeros(0)
    setExplosionOccurred(false)
    
    if (zeroAnimationRef.current) {
      clearInterval(zeroAnimationRef.current as any)
      zeroAnimationRef.current = null
    }
    
    const element = document.getElementById('customer-counter')
    element?.classList.remove('warning', 'danger', 'exploding')
    document.querySelectorAll('.zero-particle').forEach(p => p.remove())
  }

  useEffect(() => {
    if (explosionCount >= 3) {
    }
  }, [explosionCount])

  useEffect(() => {
    // Trigger initial explosion immediately on page load
    const timer = setTimeout(() => {
      if (!initialExplosionDone && explosionCount === 0) {
        setInitialExplosionDone(true)
        setExplosionCount(1) // Count the initial explosion
        setExplosionOccurred(true)
        createExplosion()
      }
    }, 500) // Small delay to ensure DOM is ready

    return () => {
      clearTimeout(timer)
      if (zeroAnimationRef.current) {
        clearInterval(zeroAnimationRef.current as any)
      }
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Start zero animation after a delay to let the counter finish
          setTimeout(() => {
            startZeroAnimation()
          }, 3000)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const targetValues = {
      customers: 100000,
      rating: 4.5,
      countries: 150,
      uptime: 99.9
    }

    const duration = 2000 // 2 seconds
    const steps = 60
    const increment = {
      customers: targetValues.customers / steps,
      rating: targetValues.rating / steps,
      countries: targetValues.countries / steps,
      uptime: targetValues.uptime / steps
    }

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      if (currentStep >= steps) {
        setCounters(targetValues)
        clearInterval(timer)
      } else {
        setCounters({
          customers: Math.floor(increment.customers * currentStep),
          rating: parseFloat((increment.rating * currentStep).toFixed(1)),
          countries: Math.floor(increment.countries * currentStep),
          uptime: parseFloat((increment.uptime * currentStep).toFixed(1))
        })
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible])

  useEffect(() => {
    return () => {
      if (zeroAnimationRef.current) {
        cancelAnimationFrame(zeroAnimationRef.current)
      }
    }
  }, [])

  return (
    <section ref={sectionRef} className="w-full py-20 relative overflow-hidden" style={{background: "var(--background)"}}>
      {/* Modern sophisticated background */}
      
      {/* Subtle base gradient */}
      <div 
        className="absolute inset-0" 
        style={{
          background: `
            linear-gradient(135deg, 
              var(--background) 0%, 
              rgba(139, 92, 246, 0.015) 25%, 
              rgba(168, 85, 247, 0.02) 50%, 
              rgba(196, 181, 253, 0.015) 75%, 
              var(--background) 100%
            )
          `
        }}
      />
      
      {/* Modern mesh gradient */}
      <div 
        className="absolute inset-0 opacity-6"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 30%, var(--purple-800) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, var(--purple-700) 0%, transparent 45%),
            radial-gradient(ellipse at 40% 70%, var(--purple-600) 0%, transparent 55%),
            radial-gradient(ellipse at 90% 80%, var(--purple-900) 0%, transparent 40%),
            radial-gradient(ellipse at 10% 90%, var(--purple-800) 0%, transparent 35%)
          `
        }}
      />
      
      {/* Subtle animated orbs */}
      <motion.div 
        className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, 
              rgba(139, 92, 246, 0.06) 0%, 
              rgba(168, 85, 247, 0.03) 30%, 
              transparent 70%
            )
          `,
          filter: "blur(80px)"
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: [0.4, 0, 0.6, 1]
        }}
      />
      
      {/* Modern grid pattern */}
      <div 
        className="absolute inset-0 opacity-2"
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center"
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
            <a href="#pricing" style={{ textDecoration: 'none', color: 'inherit' }}>
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
              <div className="relative bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-2xl border border-border/30 rounded-2xl px-4 sm:px-6 lg:px-10 py-4 sm:py-5 lg:py-6 shadow-2xl shadow-purple-500/20 hover:shadow-3xl hover:shadow-purple-500/30 transition-all duration-500">
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
                
                <motion.div className="relative flex items-center justify-center min-h-[48px] sm:min-h-[56px]">
                  {/* Enhanced background effects for Join Us */}
                  {typeof currentZeros === 'string' && currentZeros.length > 3 && (
                    <>
                      {/* Radial glow background */}
                      <motion.div 
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background: 'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.3) 0%, rgba(236, 72, 153, 0.2) 30%, transparent 60%)',
                          filter: 'blur(20px)',
                          width: '150%',
                          height: '120%',
                          left: '-25%',
                          top: '-10%'
                        }}
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [-5, 5, -5]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      {/* Shimmer sweep effect */}
                      <motion.div 
                        className="absolute inset-0 rounded-2xl overflow-hidden"
                      >
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{
                            x: ['-100%', '100%']
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.div>
                      {/* Floating particles */}
                      {[...Array(10)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-purple-300 rounded-full"
                          style={{
                            left: `${i * 12}%`,
                            top: `${(i % 2) * 40}%`
                          }}
                          animate={{
                            y: [0, -10, 0],
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </>
                  )}
                  
                  <motion.span 
                    className="font-black relative text-2xl sm:text-3xl"
                    style={{
                      // User's previous size reduction:
                      // fontSize: isAnimating && typeof currentZeros === 'number' ? `${Math.min(1.4 + (currentZeros / 999 * 1.2), 2.8)}rem` : (typeof currentZeros === 'string' && currentZeros.length > 3 ? '1.4rem sm:1.6rem' : '1.8rem sm:2rem'),
                      
                      // New size to match other counters:
                      // fontSize: isAnimating && typeof currentZeros === 'number' ? `${Math.min(1.2 + (currentZeros / 999 * 1.0), 2.4)}rem` : (typeof currentZeros === 'string' && currentZeros.length > 3 ? '1.2rem sm:1.4rem' : '2.4rem'),
                      
                      // Force smaller size for Join-Us!:
                      // fontSize: typeof currentZeros === 'string' && currentZeros.length > 3 ? '1rem sm:1.2rem' : '2.4rem',
                      
                      // Try direct override:
                      fontSize: typeof currentZeros === 'string' && currentZeros.length > 3 ? '0.75rem !important' : '2.4rem !important',
                      transition: 'font-size 0.02s ease',
                      display: 'inline-block',
                      transform: 'translateX(0%)',
                      maxWidth: '100%',
                      overflow: 'visible',
                      whiteSpace: typeof currentZeros === 'string' ? 'nowrap' : 'nowrap',
                      textAlign: 'center',
                      wordBreak: 'break-word',
                      cursor: currentZeros === "Join-Us!" ? 'pointer' : 'default',
                      //FUCK AI!!
                      //background: typeof currentZeros === 'string' 
                      //</motion.div>  ? 'linear-gradient(135deg, #ec4899, #ec4899, #ec4899)'
                       // : 'linear-gradient(135deg, #a855f7, #ec4899)',
                      WebkitBackgroundClip: typeof currentZeros === 'string' && currentZeros.length <= 3 ? 'text' : 'border-box',
                      WebkitTextFillColor: typeof currentZeros === 'string' && currentZeros.length <= 3 ? 'transparent' : '#e39dffff',
                      color: typeof currentZeros === 'string' && currentZeros.length <= 3 ? 'transparent' : '#ffffff',
                      textShadow: typeof currentZeros === 'string' && currentZeros.length > 3 ? '0 0 20px rgba(236, 72, 153, 0.8), 0 0 40px rgba(236, 72, 153, 0.6)' : 'none',
                      fontWeight: typeof currentZeros === 'string' && currentZeros.length > 3 ? '800' : '900',
                      letterSpacing: typeof currentZeros === 'string' && currentZeros.length > 3 ? '0.05em' : 'normal',
                      filter: typeof currentZeros === 'string' ? 'drop-shadow(0 0 30px rgba(236, 72, 153, 0.5))' : 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.3))'
                    }}
                    animate={{
                      backgroundPosition: typeof currentZeros === 'string' ? ['0% 50%', '100% 50%', '0% 50%'] : ['0% 50%', '50% 50%', '100% 50%', '50% 50%', '0% 50%'],
                      transform: typeof currentZeros === 'string' 
                        ? ['scale(1)', 'scale(1.05)', 'scale(1)']
                        : ['scale(1)', 'scale(1.02)', 'scale(1)'],
                    }}
                    transition={{
                      duration: typeof currentZeros === 'string' ? 3 : 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    whileHover={currentZeros === "Join-Us!" ? { scale: 1.1 } : {}}
                  >
                    {currentZeros}
                  </motion.span>
                  
                  {/* Dynamic glow aura */}
                  <motion.div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(ellipse at center, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.1) 40%, transparent 70%)`,
                      filter: 'blur(25px)'
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0, 0.7, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Shimmer effect */}
                  <motion.div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 overflow-hidden"
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
            </a>
            
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
              {/* Animated gradient border with morphing effect */}
              <motion.div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                  background: 'linear-gradient(45deg, rgba(251, 191, 36, 0.3), rgba(251, 146, 60, 0.3), rgba(251, 191, 36, 0.3))'
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
              <div className="relative bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-2xl border border-border/30 rounded-2xl px-10 py-6 shadow-2xl shadow-amber-500/20 hover:shadow-3xl hover:shadow-amber-500/30 transition-all duration-500">
                {/* Animated background particles */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  <motion.div 
                    className="absolute w-32 h-32 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl"
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
                    className="absolute w-24 h-24 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-full blur-2xl"
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
                      linear-gradient(90deg, var(--amber-400) 1px, transparent 1px),
                      linear-gradient(0deg, var(--amber-400) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                />
                
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
                    <motion.div
                      className="relative"
                      style={{ fontSize: '2rem' }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <motion.span
                          key={i}
                          className="absolute font-black"
                          style={{
                            background: 'linear-gradient(135deg, #fbbf24, #fb923c)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            color: 'transparent',
                            filter: 'drop-shadow(0 0 15px rgba(251, 191, 36, 0.4))',
                            left: `${i * 1.2}rem`,
                            opacity: i < Math.floor(counters.rating) ? 1 : 0.3
                          }}
                          animate={{
                            scale: i < Math.floor(counters.rating) ? [1, 1.1, 1] : [1, 1.05, 1],
                            rotate: i < Math.floor(counters.rating) ? [0, 15, -15, 0] : [0, 5, -5, 0]
                          }}
                          transition={{
                            duration: 2 + i * 0.2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          ★
                        </motion.span>
                      ))}
                    </motion.div>
                  </div>
                  
                  {/* Dynamic glow aura */}
                  <motion.div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(ellipse at center, rgba(251, 191, 36, 0.15) 0%, rgba(251, 146, 60, 0.1) 40%, transparent 70%)`,
                      filter: 'blur(25px)'
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0, 0.7, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Shimmer effect */}
                  <motion.div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 overflow-hidden"
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Enhanced label with icon */}
            <motion.div 
              className="relative inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-muted/60 to-muted/40 backdrop-blur-md border border-border/40 text-sm font-semibold text-muted-foreground group-hover:text-foreground group-hover:from-amber-500/10 group-hover:to-orange-500/10 group-hover:border-amber-500/30 transition-all duration-500 shadow-lg shadow-amber-500/5 group-hover:shadow-amber-500/20"
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated icon */}
              <motion.div 
                className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 opacity-60 group-hover:opacity-100 flex items-center justify-center"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="text-white text-xs font-bold">★</span>
              </motion.div>
              <span className="relative z-10">Rating</span>
              {/* Animated underline */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-full"
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
              {/* Animated gradient border with morphing effect */}
              <motion.div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                  background: 'linear-gradient(45deg, rgba(16, 185, 129, 0.3), rgba(20, 184, 166, 0.3), rgba(16, 185, 129, 0.3))'
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
              <div className="relative bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-2xl border border-border/30 rounded-2xl px-10 py-6 shadow-2xl shadow-emerald-500/20 hover:shadow-3xl hover:shadow-emerald-500/30 transition-all duration-500">
                {/* Animated background particles */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  <motion.div 
                    className="absolute w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl"
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
                    className="absolute w-24 h-24 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-full blur-2xl"
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
                      linear-gradient(90deg, var(--emerald-400) 1px, transparent 1px),
                      linear-gradient(0deg, var(--emerald-400) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                />
                
                <motion.div className="relative flex items-center justify-center min-h-[56px]">
                  <div className="flex items-baseline gap-2">
                    <motion.span
                      className="font-black relative"
                      style={{
                        fontSize: '2.4rem',
                        background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        color: 'transparent',
                        filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.3))'
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
                      {counters.countries}
                    </motion.span>
                    <motion.div className="relative">
                      <motion.span
                        className="font-black relative"
                        style={{
                          fontSize: '2rem',
                          background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          color: 'transparent',
                          filter: 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.4))'
                        }}
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
                      
                      {/* Globe animation around plus sign */}
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{
                          rotate: [0, 360]
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <motion.div 
                          className="w-8 h-8 border-2 border-emerald-500/30 rounded-full"
                          style={{
                            borderTopColor: 'rgba(16, 185, 129, 0.6)',
                            borderRightColor: 'rgba(20, 184, 166, 0.6)'
                          }}
                        />
                      </motion.div>
                    </motion.div>
                  </div>
                  
                  {/* Dynamic glow aura */}
                  <motion.div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(ellipse at center, rgba(16, 185, 129, 0.15) 0%, rgba(20, 184, 166, 0.1) 40%, transparent 70%)`,
                      filter: 'blur(25px)'
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0, 0.7, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Shimmer effect */}
                  <motion.div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 overflow-hidden"
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Enhanced label with icon */}
            <motion.div 
              className="relative inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-muted/60 to-muted/40 backdrop-blur-md border border-border/40 text-sm font-semibold text-muted-foreground group-hover:text-foreground group-hover:from-emerald-500/10 group-hover:to-teal-500/10 group-hover:border-emerald-500/30 transition-all duration-500 shadow-lg shadow-emerald-500/5 group-hover:shadow-emerald-500/20"
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated icon */}
              <motion.div 
                className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 opacity-60 group-hover:opacity-100 flex items-center justify-center"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="text-white text-xs font-bold">🌍</span>
              </motion.div>
              <span className="relative z-10">Countries</span>
              {/* Animated underline */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-full"
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
              {/* Animated gradient border with morphing effect */}
              <motion.div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                  background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3))'
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
              <div className="relative bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-2xl border border-border/30 rounded-2xl px-10 py-6 shadow-2xl shadow-blue-500/20 hover:shadow-3xl hover:shadow-blue-500/30 transition-all duration-500">
                {/* Animated background particles */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  <motion.div 
                    className="absolute w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
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
                    className="absolute w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-2xl"
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
                      linear-gradient(90deg, var(--blue-400) 1px, transparent 1px),
                      linear-gradient(0deg, var(--blue-400) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                />
                
                <motion.div className="relative flex items-center justify-center min-h-[56px]">
                  <div className="flex items-baseline gap-2">
                    <motion.span
                      className="font-black relative"
                      style={{
                        fontSize: '2.4rem',
                        background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        color: 'transparent',
                        filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))'
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
                      {counters.uptime}
                    </motion.span>
                    <motion.div className="relative">
                      <motion.span
                        className="font-black relative"
                        style={{
                          fontSize: '2rem',
                          background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          color: 'transparent',
                          filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.4))'
                        }}
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
                      
                      {/* Pulse rings around percentage */}
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        {[...Array(3)].map((_, i) => (
                          <motion.div 
                            key={i}
                            className="absolute border border-blue-500/20 rounded-full"
                            style={{
                              width: `${2 + i * 0.8}rem`,
                              height: `${2 + i * 0.8}rem`
                            }}
                            animate={{
                              scale: [1, 1.5, 2],
                              opacity: [0.6, 0.3, 0]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              delay: i * 0.5,
                              ease: "easeOut"
                            }}
                          />
                        ))}
                      </motion.div>
                    </motion.div>
                  </div>
                  
                  {/* Dynamic glow aura */}
                  <motion.div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 40%, transparent 70%)`,
                      filter: 'blur(25px)'
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0, 0.7, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Shimmer effect */}
                  <motion.div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 overflow-hidden"
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Enhanced label with icon */}
            <motion.div 
              className="relative inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-muted/60 to-muted/40 backdrop-blur-md border border-border/40 text-sm font-semibold text-muted-foreground group-hover:text-foreground group-hover:from-blue-500/10 group-hover:to-cyan-500/10 group-hover:border-blue-500/30 transition-all duration-500 shadow-lg shadow-blue-500/5 group-hover:shadow-blue-500/20"
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated icon */}
              <motion.div 
                className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 opacity-60 group-hover:opacity-100 flex items-center justify-center"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="text-white text-xs font-bold">⚡</span>
              </motion.div>
              <span className="relative z-10">Uptime</span>
              {/* Animated underline */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-full"
                initial={{ scaleX: 0, opacity: 0 }}
                whileHover={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
