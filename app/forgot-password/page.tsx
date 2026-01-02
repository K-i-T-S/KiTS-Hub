"use client"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { useState } from "react"
import { validateEmail, RateLimiter } from "@/lib/security"

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const rateLimiter = new RateLimiter(3, 300000) // 3 attempts per 5 minutes

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!rateLimiter.canAttempt()) {
      newErrors.submit = 'Too many attempts. Please try again later.'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Password reset requested for:', validateEmail(email).sanitized)
      setIsSubmitted(true)
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      <main className="py-20 px-6">
        <div className="container mx-auto max-w-md">
          <section className="bg-zinc-900 rounded-lg p-8" aria-labelledby="forgot-password-heading">
            <header className="text-center mb-6">
              <div className="flex justify-center mb-6" aria-hidden="true">
                <Mail className="w-12 h-12 text-indigo-400" />
              </div>
              
              <h1 id="forgot-password-heading" className="text-3xl font-bold text-white mb-6">
                Forgot your password?
              </h1>
              
              <p className="text-zinc-400 text-center mb-8">
                No problem. Enter your email address below and we&apos;ll send you a link to reset your password.
              </p>
            </header>
            
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate aria-label="Password reset form">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 bg-zinc-800 border rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 ${
                        errors.email ? 'border-red-500' : 'border-zinc-700'
                      }`}
                      placeholder="Enter your email"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className="mt-2 text-sm text-red-400">
                      {errors.email}
                    </p>
                  )}
                </div>
                
                {errors.submit && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400">
                      {errors.submit}
                    </p>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full rounded-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  Check your email
                </h2>
                <p className="text-zinc-400">
                  We&apos;ve sent a password reset link to <strong>{validateEmail(email).sanitized}</strong>
                </p>
                <p className="text-sm text-zinc-500">
                  Didn&apos;t receive the email? Check your spam folder or try again later.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmail('')
                  }}
                >
                  Try again
                </Button>
              </div>
            )}
            
            <footer className="mt-6 text-center">
              <Link href="/login" className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to login
              </Link>
            </footer>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
