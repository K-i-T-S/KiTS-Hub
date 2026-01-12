"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from '../../lib/utils'

interface AdvancedGlassCardProps {
  children: React.ReactNode
  className?: string
  variant?: "subtle" | "medium" | "strong" | "liquid" | "premium"
  blur?: "sm" | "md" | "lg" | "xl"
  opacity?: number
  borderColor?: string
  glowEffect?: boolean
  animated?: boolean
  theme?: "light" | "dark"
}

export function AdvancedGlassCard({
  children,
  className,
  variant = "medium",
  blur = "lg",
  opacity = 0.1,
  borderColor,
  glowEffect = true,
  animated = true,
  theme = "dark",
}: AdvancedGlassCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card || !animated) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setMousePosition({ x, y })
    }

    const handleMouseLeave = () => {
      setMousePosition({ x: 0, y: 0 })
    }

    card.addEventListener('mousemove', handleMouseMove)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      card.removeEventListener('mousemove', handleMouseMove)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [animated])

  const getVariantClasses = () => {
    switch (variant) {
      case "subtle":
        return "glass"
      case "medium":
        return "glass"
      case "strong":
        return "glass"
      case "liquid":
        return "glass shimmer"
      case "premium":
        return "premium-card"
      default:
        return "glass"
    }
  }

  const getBlurValue = () => {
    switch (blur) {
      case "sm": return "blur(8px)"
      case "md": return "blur(12px)"
      case "lg": return "blur(20px)"
      case "xl": return "blur(24px)"
      default: return "blur(20px)"
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case "subtle":
        return {
          background: `rgba(255, 255, 255, ${opacity * 0.5})`,
          border: borderColor || `rgba(255, 255, 255, ${opacity * 0.3})`,
          boxShadow: glowEffect ? `0 4px 20px rgba(168, 85, 247, ${opacity * 0.2})` : "none"
        }
      case "medium":
        return {
          background: `rgba(255, 255, 255, ${opacity})`,
          border: borderColor || `rgba(255, 255, 255, ${opacity * 0.4})`,
          boxShadow: glowEffect ? `0 8px 32px rgba(168, 85, 247, ${opacity * 0.3})` : "none"
        }
      case "strong":
        return {
          background: `rgba(255, 255, 255, ${opacity * 1.5})`,
          border: borderColor || `rgba(255, 255, 255, ${opacity * 0.6})`,
          boxShadow: glowEffect ? `0 12px 48px rgba(168, 85, 247, ${opacity * 0.4})` : "none"
        }
      case "liquid":
        return {
          background: `linear-gradient(135deg, rgba(255, 255, 255, ${opacity}) 0%, rgba(168, 85, 247, ${opacity * 0.3}) 50%, rgba(255, 255, 255, ${opacity}) 100%)`,
          border: borderColor || `rgba(168, 85, 247, ${opacity * 0.5})`,
          boxShadow: glowEffect ? `0 16px 64px rgba(168, 85, 247, ${opacity * 0.5})` : "none"
        }
      case "premium":
        return {
          // Use the premium-card class styles
        }
      default:
        return {
          background: `rgba(255, 255, 255, ${opacity})`,
          border: borderColor || `rgba(255, 255, 255, ${opacity * 0.4})`,
          boxShadow: glowEffect ? `0 8px 32px rgba(168, 85, 247, ${opacity * 0.3})` : "none"
        }
    }
  }

  const styles = getVariantStyles()
  const mouseGradient = mousePosition.x && mousePosition.y 
    ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.3) 0%, transparent 50%)`
    : 'none'

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        getVariantClasses(),
        animated && "hover-lift",
        className
      )}
      style={{
        ...(variant !== "premium" ? styles : {}),
        backdropFilter: getBlurValue(),
        WebkitBackdropFilter: getBlurValue(),
        borderRadius: "16px",
        padding: "24px",
        background: mouseGradient ? `linear-gradient(${styles.background}), ${mouseGradient}` : styles.background,
      }}
    >
      {/* Animated gradient overlay for liquid variant */}
      {variant === "liquid" && (
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            background: "linear-gradient(135deg, transparent 0%, rgba(168, 85, 247, 0.1) 25%, transparent 50%, rgba(168, 85, 247, 0.1) 75%, transparent 100%)",
            backgroundSize: "200% 200%",
            animation: animated ? "gradient 4s ease infinite" : "none",
          }}
        />
      )}

      {/* Glow effect */}
      {glowEffect && (
        <div 
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `radial-gradient(circle at 50% 0%, rgba(168, 85, 247, ${opacity * 0.2}) 0%, transparent 70%)`,
            filter: "blur(20px)",
          }}
        />
      )}

      {/* Animated blob for premium variant */}
      {variant === "premium" && (
        <div 
          className="absolute inset-0 opacity-20 animate-blob"
          style={{
            background: "var(--gradient-primary)",
            filter: "blur(40px)",
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
