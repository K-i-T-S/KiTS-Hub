'use client'

import { useState, useEffect, useRef } from 'react'

export default function ZeroExplosionSection() {
  const [currentZeros, setCurrentZeros] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [explosionOccurred, setExplosionOccurred] = useState(false)
  const [speed, setSpeed] = useState(1)
  const animationRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const updateDisplay = () => {
    if (currentZeros === 0) return '0'
    const zeros = '0'.repeat(currentZeros)
    const grouped = zeros.match(/.{1,20}/g)?.join(' ') || zeros
    return grouped
  }

  const createExplosionParticle = (x: number, y: number) => {
    const particle = document.createElement('div')
    particle.className = 'zero-particle'
    particle.textContent = '0'
    
    const angle = Math.random() * Math.PI * 2
    const distance = 200 + Math.random() * 400
    const tx = Math.cos(angle) * distance
    const ty = Math.sin(angle) * distance
    
    particle.style.setProperty('--tx', `${tx}px`)
    particle.style.setProperty('--ty', `${ty}px`)
    particle.style.left = `${x}px`
    particle.style.top = `${y}px`
    
    document.body.appendChild(particle)
    
    setTimeout(() => {
      particle.remove()
    }, 4000)
  }

  const createExplosion = () => {
    if (explosionOccurred) return
    setExplosionOccurred(true)
    
    const flash = document.createElement('div')
    flash.className = 'explosion-flash'
    document.body.appendChild(flash)
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      for (let i = 0; i < 50; i++) {
        setTimeout(() => {
          createExplosionParticle(centerX, centerY)
        }, i * 20)
      }
    }
    
    setTimeout(() => {
      flash.remove()
      resetAnimation()
    }, 5000)
  }

  const animate = () => {
    if (!isAnimating) return
    
    setCurrentZeros(prev => {
      const newZeros = prev + Math.ceil(speed)
      
      // Warning states
      if (newZeros >= 4 && newZeros < 6) {
        containerRef.current?.classList.add('warning')
        containerRef.current?.classList.remove('danger')
      } else if (newZeros >= 6 && newZeros < 8) {
        containerRef.current?.classList.add('danger')
        containerRef.current?.classList.remove('warning')
      } else if (newZeros >= 8) {
        createExplosion()
        return prev
      } else {
        containerRef.current?.classList.remove('warning', 'danger')
      }
      
      return newZeros
    })
    
    animationRef.current = requestAnimationFrame(() => {
      setTimeout(animate, 800 / speed)
    })
  }

  const startAnimation = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setExplosionOccurred(false)
    animate()
  }

  const resetAnimation = () => {
    setIsAnimating(false)
    setCurrentZeros(0)
    setExplosionOccurred(false)
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    containerRef.current?.classList.remove('warning', 'danger')
    document.querySelectorAll('.zero-particle').forEach(p => p.remove())
  }

  const toggleSpeed = () => {
    if (speed === 1) setSpeed(2)
    else if (speed === 2) setSpeed(0.5)
    else setSpeed(1)
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-purple-600 to-blue-600 relative overflow-hidden">
      <style jsx>{`
        .zero-container {
          position: relative;
          width: 100%;
          max-width: 600px;
          height: 300px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .zero-container.warning {
          border-color: rgba(255, 200, 0, 0.8);
          background: rgba(255, 200, 0, 0.2);
          animation: shake 1s infinite;
        }
        
        .zero-container.danger {
          border-color: rgba(255, 0, 0, 0.8);
          background: rgba(255, 0, 0, 0.2);
          animation: shake 0.3s infinite;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .zero-display {
          font-size: 4rem;
          font-weight: bold;
          color: white;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .zero-particle {
          position: fixed;
          font-size: 2rem;
          font-weight: bold;
          color: white;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
          pointer-events: none;
          z-index: 100;
          animation: explode-particle 2s ease-out forwards;
        }
        
        @keyframes explode-particle {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translate(var(--tx), var(--ty)) scale(1.5) rotate(180deg);
            opacity: 0.8;
          }
          100% {
            transform: translate(calc(var(--tx) * 2), calc(var(--ty) * 2)) scale(0.5) rotate(360deg);
            opacity: 0;
          }
        }
        
        .explosion-flash {
          position: fixed;
          width: 100vw;
          height: 100vh;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 70%);
          pointer-events: none;
          z-index: 200;
          animation: flash 0.5s ease-out forwards;
        }
        
        @keyframes flash {
          0% { opacity: 0; }
          10% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        .control-btn {
          padding: 12px 24px;
          font-size: 1rem;
          font-weight: bold;
          color: white;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        
        .control-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(255, 255, 255, 0.3);
        }
        
        .control-btn:active {
          transform: translateY(0);
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Zero Overflow Explosion</h2>
        <p className="text-xl text-white/90 mb-8">
          Watch as zeros accumulate until the container explodes!
        </p>
        
        <div className="zero-container" ref={containerRef}>
          <div className="zero-display">
            {updateDisplay()}
          </div>
        </div>
        
        <div className="mt-8 text-white text-lg">
          Zero count: {currentZeros}
          {currentZeros >= 4 && currentZeros < 6 && (
            <span className="ml-2 text-yellow-300">⚠️ Warning!</span>
          )}
          {currentZeros >= 6 && currentZeros < 8 && (
            <span className="ml-2 text-red-300">🚨 Danger!</span>
          )}
          {explosionOccurred && (
            <span className="ml-2 text-white">💥 BOOM!</span>
          )}
        </div>
        
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={startAnimation}
            disabled={isAnimating}
            className="control-btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Animation
          </button>
          <button
            onClick={resetAnimation}
            className="control-btn"
          >
            Reset
          </button>
          <button
            onClick={toggleSpeed}
            className="control-btn"
          >
            Speed: {speed === 1 ? 'Normal' : speed === 2 ? 'Fast' : 'Slow'}
          </button>
        </div>
      </div>
    </section>
  )
}
