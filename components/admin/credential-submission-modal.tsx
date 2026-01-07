'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Database, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Copy,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'
import { ProvisioningQueue, CredentialSubmissionData } from '@/types/provisioning'
import { ProvisioningService } from '@/lib/provisioning'
import { toast } from 'sonner'

const credentialSchema = z.object({
  project_ref: z.string().min(20, 'Project reference must be 20 characters'),
  project_url: z.string().url('Please enter a valid URL').includes('supabase.co', 'URL must be a Supabase project URL'),
  anon_key: z.string().min(30, 'Anon key must be at least 30 characters'),
  service_role_key: z.string().min(30, 'Service role key must be at least 30 characters'),
  database_password: z.string().optional(),
  region: z.string().default('us-east-1'),
  admin_notes: z.string().optional(),
})

interface CredentialSubmissionModalProps {
  customer: ProvisioningQueue
  onClose: () => void
  onSuccess: () => void
}

export function CredentialSubmissionModal({ 
  customer, 
  onClose, 
  onSuccess 
}: CredentialSubmissionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showKeys, setShowKeys] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  
  // Generate project name once when modal opens
  const [projectName] = useState(() => {
    const randomSuffix = Math.random().toString(36).substr(2, 9)
    return `kits-${customer.customer?.company_name?.toLowerCase().replace(/\s+/g, '-')}-${randomSuffix}`
  })

  const form = useForm<CredentialSubmissionData>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      project_ref: '',
      project_url: '',
      anon_key: '',
      service_role_key: '',
      database_password: '',
      region: 'us-east-1',
      admin_notes: '',
    }
  })

  const testConnection = async (credentials: CredentialSubmissionData) => {
    setIsTestingConnection(true)
    try {
      // Only send the fields required for connection testing
      const testData = {
        project_url: credentials.project_url,
        service_role_key: credentials.service_role_key
      }
      
      const response = await fetch('/api/test-supabase-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      })

      const result = await response.json()
      
      console.log('Response status:', response.status)
      console.log('Response data:', result)
      console.log('Response ok:', response.ok)
      
      if (response.ok && result.success) {
        toast.success('Connection test successful!')
        return true
      } else {
        // Handle both API errors and validation errors
        const errorMessage = result.error || 'Connection test failed'
        console.log('Showing error toast:', errorMessage)
        toast.error(`Connection test failed: ${errorMessage}`)
        return false
      }
    } catch (error) {
      toast.error('Connection test failed')
      return false
    } finally {
      setIsTestingConnection(false)
    }
  }

  const onSubmit = async (data: CredentialSubmissionData) => {
    setIsSubmitting(true)
    try {
      // Test connection first
      const connectionOk = await testConnection(data)
      if (!connectionOk) {
        setIsSubmitting(false)
        return
      }

      // Submit credentials
      const response = await ProvisioningService.submitCredentials(
        customer.id,
        data,
        'admin-123' // This would come from auth context
      )

      if (response.success) {
        toast.success('Credentials submitted successfully! Migration started.')
        onSuccess()
      } else {
        toast.error(response.error || 'Failed to submit credentials')
      }
    } catch (error) {
      console.error('Error submitting credentials:', error)
      toast.error('Failed to submit credentials')
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const toggleKeyVisibility = () => {
    setShowKeys(!showKeys)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Submit Supabase Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Information */}
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 text-zinc-100">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-300">
              <div>
                <span className="font-medium text-zinc-200">Company:</span> {customer.customer?.company_name}
              </div>
              <div>
                <span className="font-medium text-zinc-200">Contact:</span> {customer.customer?.contact_name}
              </div>
              <div>
                <span className="font-medium text-zinc-200">Email:</span> {customer.customer?.email}
              </div>
              <div>
                <span className="font-medium text-zinc-200">Plan:</span> {customer.customer?.plan_type}
              </div>
            </div>
            
            <Separator className="my-3 bg-zinc-700" />
            
            <div>
              <span className="font-medium text-zinc-200">Requested Features:</span>
              <div className="flex flex-wrap gap-1 mt-2">
                {customer.requested_features.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs border-zinc-600 text-zinc-300">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-zinc-100">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                Setup Instructions
              </h3>
              <ol className="space-y-2 text-sm text-zinc-300">
                <li>1. Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">supabase.com/dashboard</a></li>
                <li>2. Click "New Project"</li>
                <li>3. Organization: KiTS-Customers</li>
                <li>4. Name: {projectName}</li>
                <li>5. Database Password: Generate a strong password (save it in 1Password)</li>
                <li>6. Region: Choose closest to customer</li>
                <li>7. Wait for project to initialize (~2 mins)</li>
                <li>8. Copy Project Reference from URL</li>
                <li>9. Go to Settings → API → Copy anon key & service_role_key</li>
              </ol>
            </CardContent>
          </Card>

          {/* Credential Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="project_ref"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Reference *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="abcdefghijklmnop" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="project_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project URL *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://abcdefghijklmnop.supabase.co" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="anon_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anon/Public Key *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showKeys ? "text" : "password"}
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            className="pr-20"
                            {...field}
                          />
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(field.value, 'Anon key')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={toggleKeyVisibility}
                            >
                              {showKeys ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="service_role_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Role Key *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showKeys ? "text" : "password"}
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            className="pr-20"
                            {...field}
                          />
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(field.value, 'Service role key')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={toggleKeyVisibility}
                            >
                              {showKeys ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="database_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Database Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="Database password (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="us-east-1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="admin_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any setup notes or special considerations..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Warning */}
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-800">Important</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        Please double-check all credentials before submitting. 
                        The migration process will start immediately after submission 
                        and cannot be easily reversed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => testConnection(form.getValues())}
                  disabled={isTestingConnection || isSubmitting}
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting || isTestingConnection}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Submit & Start Migration
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
