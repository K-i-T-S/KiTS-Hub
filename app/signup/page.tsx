"use client"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserPlus, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"

const features = [
  "14-day free trial",
  "No credit card required", 
  "Access to all features",
  "Cancel anytime",
  "Priority support",
  "Free setup assistance"
]

export default function Signup() {
  const { signUp } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    companySize: '',
    agreeToTerms: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number'
    }
    
    if (!formData.companySize) {
      newErrors.companySize = 'Company size is required'
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      console.log('Signup attempt:', formData)
      
      // Use actual Supabase authentication
      const { error } = await signUp(formData.email, formData.password, formData.fullName)
      
      if (error) {
        setErrors({ submit: error.message })
      } else {
        // Redirect to login page after successful signup
        router.push('/login?message=Account created successfully. Please log in.')
      }
    } catch (error) {
      setErrors({ submit: 'Failed to create account. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
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
      
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex justify-center mb-6">
                <UserPlus className="w-16 h-16 text-indigo-400" />
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-6">
                Start Your Free Trial
              </h1>
              
              <p className="text-xl text-zinc-400 mb-8">
                Join thousands of businesses using KiTS Hub to streamline their operations and accelerate growth.
              </p>
              
              <div className="space-y-3 mb-8">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center text-zinc-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
              
              <div className="text-zinc-400">
                Already have an account?{" "}
                <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
                  Sign in
                </Link>
              </div>
            </div>
            
            <div>
              <div className="bg-zinc-900 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Create Your Account
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-zinc-300 mb-2">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-zinc-800 border rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 ${
                        errors.fullName ? 'border-red-500' : 'border-zinc-700'
                      }`}
                      placeholder="Enter your full name"
                      aria-invalid={!!errors.fullName}
                      aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                    />
                    {errors.fullName && (
                      <p id="fullName-error" className="mt-2 text-sm text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>
                  
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
                        placeholder="Create a password"
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
                  
                  <div>
                    <label htmlFor="companySize" className="block text-sm font-medium text-zinc-300 mb-2">
                      Company Size
                    </label>
                    <select 
                      id="companySize"
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-zinc-800 border rounded-lg text-white focus:outline-none focus:border-indigo-500 ${
                        errors.companySize ? 'border-red-500' : 'border-zinc-700'
                      }`}
                      aria-invalid={!!errors.companySize}
                      aria-describedby={errors.companySize ? 'companySize-error' : undefined}
                    >
                      <option value="">Select company size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-1000">201-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                    {errors.companySize && (
                      <p id="companySize-error" className="mt-2 text-sm text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.companySize}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-start">
                    <input 
                      type="checkbox" 
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="mr-2 mt-1 rounded border-zinc-700 bg-zinc-800"
                      aria-invalid={!!errors.agreeToTerms}
                      aria-describedby={errors.agreeToTerms ? 'terms-error' : undefined}
                    />
                    <label className="text-sm text-zinc-300">
                      I agree to the{" "}
                      <Link href="/terms" className="text-indigo-400 hover:text-indigo-300">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p id="terms-error" className="text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.agreeToTerms}
                    </p>
                  )}
                  
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
                    {isLoading ? 'Creating account...' : 'Start Free Trial'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
