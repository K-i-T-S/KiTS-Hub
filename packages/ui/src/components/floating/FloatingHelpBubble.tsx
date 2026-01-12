"use client"

import { useState, useEffect, useRef } from "react"
import { X, MessageCircle, HelpCircle, ArrowRight } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function FloatingHelpBubble() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Show bubble after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true)
      // Start typing animation
      setTimeout(() => setIsTyping(true), 500)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsMinimized(true)
    // Hide completely after animation
    setTimeout(() => {
      setIsVisible(false)
    }, 300)
  }

  const handleChatClick = async () => {
    // Wait a moment for any animations to complete
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Method 1: Try to find and click Botpress button directly
    const selectors = [
      '[data-testid="bp-web-chat-button"]',
      '.bp-web-chat-button',
      'button[aria-label*="Chat"]',
      'button[aria-label*="chat"]',
      'button[title*="Chat"]',
      '#bp-web-chat-button',
      '.botpress-webchat-button',
      'button[class*="chat"]'
    ]
    
    for (const selector of selectors) {
      const button = document.querySelector(selector) as HTMLElement
      if (button && button.offsetParent !== null) { // Check if button is visible
        button.click()
        console.log('Clicked Botpress button with selector:', selector)
        break
      }
    }
    
    // Method 2: Try to trigger via Botpress API
    if (typeof window !== 'undefined' && (window as any).botpressWebChat) {
      try {
        ;(window as any).botpressWebChat.sendEvent({ type: 'show' })
        ;(window as any).botpressWebChat.sendEvent({ type: 'open' })
        ;(window as any).botpressWebChat.sendEvent({ type: 'trigger' })
        console.log('Sent Botpress events')
      } catch (error) {
        console.log('Botpress API error:', error)
      }
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-xs">
      <div
        className={`
          relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900
          text-white rounded-2xl shadow-2xl p-4 mb-3 border border-blue-500/20
          transform transition-all duration-500 ease-out
          ${isMinimized ? 'scale-0 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'}
          backdrop-blur-xl
          before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br 
          before:from-blue-500/10 before:to-purple-500/10 before:-z-10
        `}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
        
        {/* Header */}
        <div className="flex items-start justify-between mb-3 relative z-10">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <div>
              <span className="font-semibold text-sm block">Need Assistance?</span>
              <span className="text-xs text-blue-200">We're here to help</span>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/60 hover:text-white transition-all duration-200 p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message with typing effect */}
        <div className="mb-4 relative z-10">
          <p className="text-sm leading-relaxed text-blue-100">
            {isTyping && (
              <span>
                Welcome to KiTS Hub! 🚀 Have questions about our platform? Press the KiTS logo to chat with me.
              </span>
            )}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2 relative z-10">
          <button
            onClick={handleChatClick}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 group"
          >
            <MessageCircle className="w-4 h-4 group-hover:animate-bounce" />
            <span>Press KiTS logo to chat</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 bg-white/10 text-white/80 text-xs rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
          >
            Later
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-2 right-2 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-3 left-3 w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-8 left-8 w-0.5 h-0.5 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Floating indicator */}
        <div className="absolute -top-2 -right-2 flex items-center justify-center">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
          <div className="absolute w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-ping"></div>
        </div>
      </div>
    </div>
  )
}
