"use client"

import { useEffect, useState, useRef } from 'react'
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
  const [currentZeros, setCurrentZeros] = useState(0)
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
      
      // Increment explosion count only if this wasn't the initial explosion
      if (!initialExplosionDone) {
        const newCount = explosionCount + 1
        setExplosionCount(newCount)
        
        // Check if we've reached 3 explosions
        if (newCount >= 3) {
          // Become static at 999
          resetZeroAnimation()
          setCurrentZeros(999)
          setIsAnimating(false)
          setExplosionOccurred(true)
        } else {
          // Normal explosion reset and restart
          resetZeroAnimation()
          setTimeout(() => {
            startZeroAnimation()
          }, 2000)
        }
      } else {
        // This was the initial explosion, just reset and start normal animation
        resetZeroAnimation()
        setTimeout(() => {
          startZeroAnimation()
        }, 2000)
      }
    }, 3000)
  }

  const animateZeros = () => {
    if (!isAnimating) return
    
    setCurrentZeros(prev => {
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
    if (currentZeros < 8) {
      zeroAnimationRef.current = requestAnimationFrame(() => {
        setTimeout(animateZeros, 600)
      })
    }
  }

  const startZeroAnimation = () => {
    // Don't start if we've already had 3 explosions
    if (explosionCount >= 3) return
    
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
    <section ref={sectionRef} className="w-full py-16 bg-zinc-900/50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2 flex flex-col items-center">
            <div id="customer-counter" className="text-3xl md:text-4xl font-bold text-zinc-100 cursor-pointer" onClick={explosionCount >= 3 ? undefined : resetZeroAnimation}>
              <span style={{
                fontSize: isAnimating ? `${Math.min(1.2 + (currentZeros / 999 * 1.3), 2.5)}rem` : 'inherit',
                transition: 'font-size 0.02s ease',
                display: 'inline-block',
                transform: 'translateX(0%)', // Remove left shift for centering
                maxWidth: '100%',
                overflow: 'visible',
                whiteSpace: 'nowrap'
              }}>
                {isAnimating ? currentZeros : explosionOccurred ? '💥' : 999}
              </span>
            </div>
            <div className="text-sm text-zinc-400">Customers</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl font-bold text-zinc-100">
              {counters.rating}★
            </div>
            <div className="text-sm text-zinc-400">Rating</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl font-bold text-zinc-100">
              {counters.countries}+
            </div>
            <div className="text-sm text-zinc-400">Countries</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl font-bold text-zinc-100">
              {counters.uptime}%
            </div>
            <div className="text-sm text-zinc-400">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  )
}
