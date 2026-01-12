"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { cn } from '../../lib/utils'

interface LiquidMetalBorderProps {
  children: React.ReactNode
  className?: string
  borderRadius?: number
  borderWidth?: number
  colorBack?: string
  colorTint?: string
  repetition?: number
  softness?: number
  shiftRed?: number
  shiftBlue?: number
  distortion?: number
  contour?: number
  angle?: number
  speed?: number
  scale?: number
  opacity?: number
  theme?: "light" | "dark"
  fallback?: boolean
}

// Advanced liquid metal gradient component with shimmer effect
const LiquidMetalFallback = ({ theme }: { theme: "light" | "dark" }) => (
  <div className="relative w-full h-full">
    {/* Base gradient */}
    <div
      className="absolute inset-0"
      style={{
        background: theme === "light"
          ? "linear-gradient(135deg, #d1d5db 0%, #9ca3af 25%, #d1d5db 50%, #9ca3af 75%, #d1d5db 100%)"
          : "linear-gradient(135deg, #71717a 0%, #52525b 25%, #71717a 50%, #52525b 75%, #71717a 100%)",
        backgroundSize: "200% 200%",
        animation: "liquid-metal 4s ease infinite",
      }}
    />
    {/* Shimmer overlay */}
    <div
      className="absolute inset-0 shimmer"
      style={{
        background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)",
        backgroundSize: "200% 100%",
        animation: "shimmer 2s infinite",
      }}
    />
  </div>
)

export function LiquidMetalBorder({
  children,
  className,
  borderRadius = 9999,
  borderWidth = 3,
  colorBack,
  colorTint,
  repetition = 7,
  softness = 0.05,
  shiftRed = 0.6,
  shiftBlue = 0.3,
  distortion = 0.1,
  contour = 0.4,
  angle = 90,
  speed = 0.9,
  scale = 4,
  opacity = 0.7,
  theme = "dark",
}: LiquidMetalBorderProps) {
  const defaultColorBack = theme === "light" ? "#888888" : "#aaaaac"
  const defaultColorTint = theme === "light" ? "#ffffff" : "#ffffff"

  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      {
        rootMargin: "100px",
        threshold: 0,
      },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      style={{
        borderRadius,
        padding: borderWidth,
      }}
    >
      <div className="absolute inset-0 z-0 overflow-hidden liquid-metal-border" style={{ borderRadius, opacity }}>
        <LiquidMetalFallback theme={theme} />
      </div>

      <div
        className="relative z-10"
        style={{
          borderRadius: borderRadius - borderWidth,
        }}
      >
        {children}
      </div>
    </div>
  )
}
