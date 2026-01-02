# Supabase Integration Setup Guide

This guide walks you through the complete Supabase integration for KiTS Hub v2.0, including database setup, authentication, analytics, and Stripe integration.

## 🚀 Quick Start

### 1. Database Setup

Run the migration files in order:

```bash
# Apply initial schema
supabase db push --include-tags schema

# Apply enhanced schema with analytics
supabase db push --include-tags enhanced
```

Or manually run:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_enhanced_schema.sql`

### 2. Environment Variables

Update your `.env.local` with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3. Stripe Setup

1. Create Stripe products and prices
2. Update the `plans` table with your Stripe price IDs
3. Configure webhook endpoint: `https://your-domain.com/api/stripe/webhook`

## 📊 Database Schema Overview

### Core Tables

#### `profiles`
- User profiles extending auth.users
- Role management (user/admin)
- Login tracking

#### `leads`
- Lead management system
- Status tracking (new → contacted → qualified → converted → closed)
- Source attribution

#### `contacts`
- Contact information linked to leads
- Notes and communication history

#### `subscriptions`
- Stripe subscription management
- Payment status tracking
- Trial and billing periods

### Analytics Tables

#### `visitors`
- Anonymous and authenticated visitor tracking
- Session management
- Device and browser analytics

#### `page_views`
- Page-level analytics
- Time on page tracking
- Scroll depth monitoring

#### `audit_logs`
- Complete audit trail of all user actions
- Automatic triggers on important tables
- IP and user agent tracking

#### `website_events`
- Custom event tracking
- Form submissions, button clicks, downloads
- Flexible properties storage

### Supporting Tables

#### `plans`
- Subscription plans and pricing
- Feature definitions
- Stripe integration

#### `website_settings`
- Dynamic configuration
- Public and private settings
- Runtime customization

#### `newsletter_subscriptions`
- Email newsletter management
- Subscription status tracking

#### `contact_submissions`
- Contact form submissions
- Priority and assignment tracking

#### `uploads`
- File management system
- Public/private file access
- Storage integration

## 🔐 Authentication System

### Features
- Email/password authentication
- Profile auto-creation on signup
- Role-based access control
- Session management
- Password reset functionality

### Usage

```tsx
import { useAuth } from '@/components/providers/auth-provider'

function MyComponent() {
  const { user, profile, signIn, signUp, signOut } = useAuth()
  
  // Check admin access
  if (profile?.is_admin) {
    // Admin content
  }
}
```

## 📈 Analytics System

### Features
- Automatic visitor tracking
- Page view analytics
- Event tracking
- Scroll depth monitoring
- Device and browser analytics

### Usage

```tsx
import { useAnalytics } from '@/lib/analytics'

function MyComponent() {
  const { trackEvent, trackPageView, trackButtonClick } = useAnalytics()
  
  useEffect(() => {
    trackPageView()
    trackEvent('page', 'loaded', { component: 'MyComponent' })
  }, [])
  
  const handleClick = () => {
    trackButtonClick('subscribe-button', 'hero-section')
  }
}
```

## 💳 Stripe Integration

### Features
- Subscription management
- Webhook processing
- Customer creation
- Payment status tracking
- Billing portal access

### API Endpoints

#### Webhook Handler
`POST /api/stripe/webhook`

Handles:
- Checkout completion
- Payment success/failure
- Subscription creation/updates/deletion

### Usage

```tsx
import { createCheckoutSession } from '@/lib/stripe'

const session = await createCheckoutSession(
  customerId,
  priceId,
  `${origin}/success`,
  `${origin}/cancel`,
  { user_id: userId }
)
```

## 🛡️ Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Admin-only access to sensitive data
- User-specific data access
- Anonymous visitor tracking

### Audit Logging
- Automatic triggers on all important tables
- Complete change tracking
- IP and user agent logging
- Action categorization

### Data Protection
- Environment variable security
- Service role key isolation
- Input validation
- SQL injection prevention

## 📋 Admin Dashboard

### Features
- Lead management with filtering
- Contact database
- Subscription monitoring
- Visitor analytics
- Quick stats dashboard

### Access Control
- Admin-only access (`profile.is_admin = true`)
- Role-based permissions
- Secure data access

## 🔧 Development Setup

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js stripe @hookform/resolvers
```

### 2. Database Types
```bash
supabase gen types typescript --project-id your-project > types/database.ts
```

### 3. Environment Setup
Copy `.env.local.example` to `.env.local` and fill in your credentials.

### 4. Run Migrations
```bash
supabase db reset
supabase db push
```

## 🚀 Deployment

### Vercel Environment Variables
Add these to your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Webhook Configuration
1. In Stripe dashboard, add webhook endpoint
2. URL: `https://your-vercel-app.vercel.app/api/stripe/webhook`
3. Events: checkout.session.completed, invoice.*, customer.subscription.*

## 📊 Monitoring

### Key Metrics to Track
- User registration and login rates
- Lead conversion funnel
- Subscription lifecycle
- Page performance
- User engagement

### Admin Dashboard Access
Visit `/admin` (requires admin role)

## 🔄 Maintenance

### Regular Tasks
1. Review audit logs for suspicious activity
2. Monitor subscription payments
3. Update pricing plans as needed
4. Backup critical data
5. Review analytics for insights

### Performance Optimization
1. Database indexes are pre-configured
2. Consider archiving old audit logs
3. Monitor Supabase usage limits
4. Optimize expensive queries

## 🐛 Troubleshooting

### Common Issues
1. **Authentication not working**: Check environment variables and RLS policies
2. **Analytics not tracking**: Ensure visitor initialization in browser
3. **Stripe webhooks failing**: Verify webhook secret and endpoint URL
4. **Admin access denied**: Check `is_admin` flag in profiles table

### Debug Mode
Add to your environment:
```env
DEBUG=supabase:*
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Hook Form](https://react-hook-form.com)

## 🤝 Support

For issues with this integration:
1. Check the Supabase dashboard for database issues
2. Review Stripe logs for payment problems
3. Check browser console for frontend errors
4. Monitor Vercel function logs for API issues
