'use client'

import { useState, useEffect, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, CheckCircle, Circle, ArrowRight, ArrowLeft, Building2, Users, Package, BarChart3, ShoppingCart, UserCheck, Calculator } from 'lucide-react'
import { OnboardingFormData } from '@/types/provisioning'
import { ProvisioningService } from '@/lib/provisioning'

const onboardingSchema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  contact_name: z.string().min(2, 'Contact name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  billing_address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  plan_type: z.enum(['starter', 'basic', 'professional', 'enterprise']),
  billing_cycle: z.enum(['monthly', 'yearly']),
  selected_features: z.array(z.string()).min(1, 'Please select at least one feature'),
  supabase_email: z.string().email('Please enter a valid email for Supabase').optional().or(z.literal('')),
  supabase_password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  referral_source: z.string().optional(),
  special_requirements: z.string().optional(),
})

const features = [
  {
    id: 'inventory',
    name: 'Inventory Management',
    description: 'Complete inventory tracking with products, categories, and stock management',
    icon: Package,
    included_in: ['starter', 'basic', 'professional', 'enterprise']
  },
  {
    id: 'pos',
    name: 'Point of Sale',
    description: 'POS system with order processing, payments, and receipts',
    icon: ShoppingCart,
    included_in: ['basic', 'professional', 'enterprise']
  },
  {
    id: 'analytics',
    name: 'Business Analytics',
    description: 'Advanced analytics, reporting, and business intelligence',
    icon: BarChart3,
    included_in: ['basic', 'professional', 'enterprise']
  },
  {
    id: 'crm',
    name: 'CRM System',
    description: 'Customer relationship management with contact management and sales pipeline',
    icon: Users,
    included_in: ['professional', 'enterprise']
  },
  {
    id: 'hr',
    name: 'Human Resources',
    description: 'HR management with employee records and payroll',
    icon: UserCheck,
    included_in: ['enterprise']
  },
  {
    id: 'accounting',
    name: 'Accounting System',
    description: 'Double-entry accounting with invoices and expenses',
    icon: Calculator,
    included_in: ['enterprise']
  }
]

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for small businesses getting started',
    popular: false
  },
  {
    id: 'basic',
    name: 'Basic',
    price: { monthly: 29, yearly: 290 },
    description: 'Great for growing businesses',
    popular: true
  },
  {
    id: 'professional',
    name: 'Professional',
    price: { monthly: 99, yearly: 990 },
    description: 'Advanced features for professional teams',
    popular: false
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: { monthly: 299, yearly: 2990 },
    description: 'Complete solution for large organizations',
    popular: false
  }
]

function OnboardingPageContent() {
  const searchParams = useSearchParams()
  const prefilledEmail = searchParams.get('email') || ''
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('basic')

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      plan_type: 'basic',
      billing_cycle: 'monthly',
      selected_features: ['inventory'],
      email: prefilledEmail || '',
      supabase_email: '',
      supabase_password: '',
      company_name: '',
      contact_name: '',
      phone: '',
      billing_address: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
      },
      referral_source: '',
      special_requirements: '',
    }
  })

  const watchedPlan = form.watch('plan_type')
  const watchedFeatures = form.watch('selected_features')
  const watchedBillingCycle = form.watch('billing_cycle')

  useEffect(() => {
    setSelectedPlan(watchedPlan)
    // Auto-select features based on plan
    const planFeatures = features
      .filter(f => f.included_in.includes(watchedPlan))
      .map(f => f.id)
    form.setValue('selected_features', planFeatures)
  }, [watchedPlan, form])

  const totalSteps = 5
  const progressPercentage = (currentStep / totalSteps) * 100

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: OnboardingFormData) => {
    console.log('🚀 Form submission started:', data)
    setIsSubmitting(true)
    try {
      // First create customer account
      console.log('📧 Creating customer account...')
      const customerResponse = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          company_name: data.company_name,
          contact_name: data.contact_name,
          phone: data.phone,
          plan_type: data.plan_type,
        })
      })

      console.log('📧 Customer response status:', customerResponse.status)

      if (!customerResponse.ok) {
        const errorData = await customerResponse.json().catch(() => ({}))
        console.log('📧 Customer error:', errorData)
        if (customerResponse.status === 409) {
          throw new Error('An account with this email already exists. Please use a different email or contact support.')
        }
        throw new Error(errorData.error || 'Failed to create customer account')
      }

      const { customer_id } = await customerResponse.json()
      console.log('📧 Customer created with ID:', customer_id)

      // Then create provisioning request via API
      console.log('⚙️ Creating provisioning request...')
      const provisioningResponse = await fetch('/api/provisioning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id,
          plan_type: data.plan_type,
          selected_features: data.selected_features,
          supabase_email: data.supabase_email,
          supabase_password: data.supabase_password,
        })
      })

      const provisioningResult = await provisioningResponse.json()
      console.log('⚙️ Provisioning response:', provisioningResult)

      if (!provisioningResponse.ok || !provisioningResult.success) {
        throw new Error(provisioningResult.error || 'Failed to create provisioning request')
      }

      toast.success('Account created successfully! Redirecting to dashboard...')
      
      // Redirect to waiting screen
      setTimeout(() => {
        window.location.href = `/onboarding/waiting?customer_id=${customer_id}`
      }, 2000)

    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred during onboarding')
    } finally {
      setIsSubmitting(false)
    }
  }

  const debugSubmit = () => {
    console.log('🔍 Debug: Submit button clicked')
    console.log('🔍 Current step:', currentStep)
    console.log('🔍 Form values:', form.getValues())
    console.log('🔍 Form errors:', form.formState.errors)
    console.log('🔍 Form is valid:', form.formState.isValid)
    console.log('🔍 Form is dirty:', form.formState.isDirty)
    
    // Show detailed billing address errors
    const billingErrors = form.formState.errors.billing_address
    if (billingErrors) {
      console.log('🔍 Billing address errors:', billingErrors)
    }
    
    // Try manual validation
    const validationResult = form.trigger()
    console.log('🔍 Validation trigger result:', validationResult)
    
    alert(`Submit button clicked! Step: ${currentStep}, Valid: ${form.formState.isValid}`)
    
    // Try to submit even if validation fails
    form.handleSubmit(onSubmit)()
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Tell us about your business</h2>
              <p className="text-muted-foreground">Help us understand your needs to provide the best experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="ACME Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="special_requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requirements</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about any specific needs or custom requirements..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Choose your plan</h2>
              <p className="text-muted-foreground">Select the plan that best fits your business needs</p>
            </div>

            <FormField
              control={form.control}
              name="billing_cycle"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col sm:flex-row gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label htmlFor="monthly">Monthly Billing</Label>
                      </div>
                  <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yearly" id="yearly" />
                        <Label htmlFor="yearly">Yearly Billing (Save 2 months)</Label>
                  </div>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-3xl font-bold">
                    ${watchedBillingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly}
                    <span className="text-lg font-normal text-muted-foreground">
                      /{watchedBillingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  {watchedBillingCycle === 'yearly' && (
                    <div className="text-sm text-green-600">
                      Save ${(plan.price.monthly * 12 - plan.price.yearly)} per year
                    </div>
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="plan_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Button
                          variant={field.value === plan.id ? 'default' : 'outline'}
                          className="w-full"
                          onClick={() => field.onChange(plan.id)}
                        >
                          {field.value === plan.id ? 'Selected' : 'Select Plan'}
                        </Button>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Select your features</h2>
              <p className="text-muted-foreground">Choose the tools you need to run your business</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature) => {
                const isIncluded = feature.included_in.includes(selectedPlan)
                const Icon = feature.icon
                
                return (
                  <Card key={feature.id} className={`cursor-pointer transition-colors ${
                    watchedFeatures.includes(feature.id) ? 'border-primary bg-primary/5' : ''
                  } ${!isIncluded ? 'opacity-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <FormField
                          control={form.control}
                          name="selected_features"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(feature.id)}
                                  onCheckedChange={(checked) => {
                                    const updated = checked
                                      ? [...field.value, feature.id]
                                      : field.value?.filter((value) => value !== feature.id)
                                    field.onChange(updated)
                                  }}
                                  disabled={!isIncluded}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-4 w-4" />
                            <h3 className="font-semibold">{feature.name}</h3>
                            {isIncluded ? (
                              <Badge variant="secondary" className="text-xs">Included</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Upgrade required</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Setup your backend</h2>
              <p className="text-muted-foreground">
                We'll create a dedicated Supabase instance for your business
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Supabase Account Details</CardTitle>
                <CardDescription>
                  These credentials will be used to create your dedicated backend
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="supabase_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supabase Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="backend@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supabase_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temporary Password *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        We'll create your Supabase account with this password. You can change it later.
                      </p>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">What happens next?</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                      <li>• Your request enters our provisioning queue (12-72 hours)</li>
                      <li>• Our team manually creates your Supabase instance</li>
                      <li>• We migrate your selected features and setup your database</li>
                      <li>• You'll receive an email when everything is ready</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Review and confirm</h2>
              <p className="text-muted-foreground">Please review your information before submitting</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Company:</strong> {form.getValues('company_name')}</div>
                  <div><strong>Contact:</strong> {form.getValues('contact_name')}</div>
                  <div><strong>Email:</strong> {form.getValues('email')}</div>
                  <div><strong>Phone:</strong> {form.getValues('phone') || 'Not provided'}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Plan:</strong> {plans.find(p => p.id === selectedPlan)?.name}</div>
                  <div><strong>Billing:</strong> {watchedBillingCycle}</div>
                  <div><strong>Price:</strong> ${watchedBillingCycle === 'yearly' 
                    ? plans.find(p => p.id === selectedPlan)?.price.yearly 
                    : plans.find(p => p.id === selectedPlan)?.price.monthly
                  }/{watchedBillingCycle === 'yearly' ? 'year' : 'month'}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Selected Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {watchedFeatures.map((featureId) => {
                    const feature = features.find(f => f.id === featureId)
                    const Icon = feature?.icon
                    return (
                      <div key={featureId} className="flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{feature?.name}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Final confirmation</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      By submitting this form, you agree to our Terms of Service and Privacy Policy.
                      Your account will be provisioned within 12-72 hours.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Welcome to KiTS</h1>
              <span className="text-sm text-zinc-400">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  {step <= currentStep ? (
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-zinc-600" />
                  )}
                  {step < totalSteps && (
                    <div className="w-8 h-0.5 bg-zinc-700 mx-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {renderStep()}

                  {/* Navigation */}
                  <div className="flex justify-between pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    {currentStep < totalSteps ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                      >
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Create Account
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <OnboardingPageContent />
    </Suspense>
  )
}
