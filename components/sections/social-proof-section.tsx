"use client"

import { useEffect, useState, useRef } from 'react'

export function SocialProofSection() {
  const [counters, setCounters] = useState({
    customers: 0,
    rating: 0,
    countries: 0,
    uptime: 0
  })
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
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

  return (
    <section ref={sectionRef} className="w-full py-16 bg-zinc-900/50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl font-bold text-zinc-100">
              {counters.customers.toLocaleString()}+
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
