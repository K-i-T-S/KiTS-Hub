'use client'

import { useEffect, useState } from 'react'

export default function FloatingCloud() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-20 right-4 z-40 pointer-events-none">
      <div className="relative animate-float">
        {/* Advanced cloud container with gradient background */}
        <div className="relative group">
          {/* Main cloud body with gradient */}
          <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-full shadow-xl px-3 py-1.5 border border-white/80 backdrop-blur-md">
            <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap drop-shadow-sm">
              KiTS-Bot
            </span>
            
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-sm"></div>
          </div>
          
          {/* Multiple cloud puffs with different sizes and animations */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-gradient-to-br from-white to-blue-100 rounded-full shadow-lg animate-puff-1"></div>
          <div className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-gradient-to-br from-white to-purple-100 rounded-full shadow-lg animate-puff-2"></div>
          <div className="absolute top-0 -right-2 w-2 h-2 bg-gradient-to-br from-white to-pink-100 rounded-full shadow-md animate-puff-3"></div>
          <div className="absolute top-0.5 -left-2 w-2 h-2 bg-gradient-to-br from-white to-blue-50 rounded-full shadow-md animate-puff-1"></div>
          <div className="absolute -bottom-0.5 left-0.5 w-1.5 h-1.5 bg-gradient-to-br from-white to-purple-50 rounded-full shadow-sm animate-puff-2"></div>
          
          {/* Sparkle effects */}
          <div className="absolute -top-2 -right-0.5 w-0.5 h-0.5 bg-blue-400 rounded-full animate-sparkle-1"></div>
          <div className="absolute -bottom-1.5 left-1 w-0.5 h-0.5 bg-purple-400 rounded-full animate-sparkle-2"></div>
          <div className="absolute top-1.5 right-1.5 w-0.5 h-0.5 bg-pink-400 rounded-full animate-sparkle-3"></div>
          
          {/* Rainbow glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 rounded-full blur-lg -z-10 scale-125 animate-rainbow"></div>
          
          {/* Outer shadow */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 to-transparent rounded-full blur-md -z-20 scale-110"></div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(-2deg) scale(1);
          }
          25% {
            transform: translateY(-12px) rotate(1deg) scale(1.05);
          }
          50% {
            transform: translateY(-6px) rotate(-1deg) scale(1.02);
          }
          75% {
            transform: translateY(-18px) rotate(2deg) scale(1.03);
          }
        }
        
        @keyframes puff-1 {
          0%, 100% {
            transform: scale(1) translateX(0);
          }
          50% {
            transform: scale(1.1) translateX(-2px);
          }
        }
        
        @keyframes puff-2 {
          0%, 100% {
            transform: scale(1) translateY(0);
          }
          50% {
            transform: scale(1.15) translateY(-1px);
          }
        }
        
        @keyframes puff-3 {
          0%, 100% {
            transform: scale(1) translateX(0);
          }
          50% {
            transform: scale(1.2) translateX(2px);
          }
        }
        
        @keyframes sparkle-1 {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes sparkle-2 {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          33% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes sparkle-3 {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          66% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes rainbow {
          0%, 100% {
            background-position: 0% 50%;
            opacity: 0.3;
          }
          50% {
            background-position: 100% 50%;
            opacity: 0.6;
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-puff-1 {
          animation: puff-1 3s ease-in-out infinite;
        }
        
        .animate-puff-2 {
          animation: puff-2 4s ease-in-out infinite 0.5s;
        }
        
        .animate-puff-3 {
          animation: puff-3 3.5s ease-in-out infinite 1s;
        }
        
        .animate-sparkle-1 {
          animation: sparkle-1 2s ease-in-out infinite;
        }
        
        .animate-sparkle-2 {
          animation: sparkle-2 2s ease-in-out infinite 0.7s;
        }
        
        .animate-sparkle-3 {
          animation: sparkle-3 2s ease-in-out infinite 1.3s;
        }
        
        .animate-rainbow {
          animation: rainbow 4s ease-in-out infinite;
          background-size: 200% 200%;
        }
      `}</style>
    </div>
  )
}
