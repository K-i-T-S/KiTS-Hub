"use client"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogIn, Lock, Mail, AlertCircle } from "lucide-react"
import { useState } from "react"
import { validateEmail, RateLimiter } from "@/lib/security"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"

export default function Login() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const rateLimiter = new RateLimiter(5, 60000) // 5 attempts per minute

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    // Email validation
    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.isValid ? '' : 'Please enter a valid email address'
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    
    // Rate limiting check
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
      console.log('Login attempt:', {
        email: validateEmail(formData.email).sanitized,
        timestamp: new Date().toISOString()
      })
      
      // Use actual Supabase authentication
      const { error } = await signIn(formData.email, formData.password)
      
      if (error) {
        setErrors({ submit: error.message })
      } else {
        // Redirect to admin dashboard or home page
        router.push('/admin')
      }
    } catch (error) {
      setErrors({ submit: 'Invalid email or password' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      <main className="py-20 px-6">
        <div className="container mx-auto max-w-md">
          <section className="bg-zinc-900 rounded-lg p-8" aria-labelledby="login-heading">
            <header className="text-center mb-6">
              <div className="flex justify-center mb-6" aria-hidden="true">
                <LogIn className="w-12 h-12 text-indigo-400" />
              </div>
              
              <h1 id="login-heading" className="text-3xl font-bold text-white mb-6">
                Welcome Back
              </h1>
              
              <p className="text-zinc-400 text-center mb-8">
                Sign in to your KiTS Hub account to access your dashboard
              </p>
            </header>
            
            <form onSubmit={handleSubmit} className="space-y-6" noValidate aria-label="Login form">
              <fieldset>
                <legend className="sr-only">Login credentials</legend>
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
                    value={formData.email}
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
                  <p id="email-error" className="mt-2 text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 bg-zinc-800 border rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 ${
                      errors.password ? 'border-red-500' : 'border-zinc-700'
                    }`}
                    placeholder="Enter your password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-2 text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center text-zinc-300">
                  <input 
                    type="checkbox" 
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="mr-2 rounded border-zinc-700 bg-zinc-800" 
                  />
                  <span className="text-sm">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300">
                  Forgot password?
                </Link>
              </div>
              
              {errors.submit && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.submit}
                  </p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full rounded-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              </fieldset>
            </form>
            
            <footer className="mt-6 text-center">
              <p className="text-zinc-400">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-indigo-400 hover:text-indigo-300">
                  Sign up for free
                </Link>
              </p>
            </footer>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
