import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      aria-hidden="true"
    />
  )
}

interface LoadingPageProps {
  message?: string
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="text-indigo-400 mx-auto mb-4" />
        <p className="text-zinc-400">{message}</p>
      </div>
    </div>
  )
}

interface LoadingCardProps {
  title?: string
  lines?: number
}

export function LoadingCard({ title, lines = 3 }: LoadingCardProps) {
  return (
    <div className="bg-zinc-900 rounded-lg p-6 animate-pulse">
      {title && (
        <div className="h-6 bg-zinc-800 rounded mb-4 w-3/4"></div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className={`h-4 bg-zinc-800 rounded ${
              i === lines - 1 ? 'w-5/6' : 'w-full'
            }`}
          ></div>
        ))}
      </div>
    </div>
  )
}

export function LoadingTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-3 text-left">
                  <div className="h-4 bg-zinc-800 rounded w-20 animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-b border-zinc-800">
                {Array.from({ length: columns }).map((_, j) => (
                  <td key={j} className="px-6 py-3">
                    <div className="h-4 bg-zinc-800 rounded w-16 animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
