import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY not found, Stripe functionality will be disabled')
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
}) : null

export default stripe

export async function createStripeCustomer(email: string, name?: string) {
  if (!stripe) throw new Error('Stripe not configured')
  try {
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
    })
    return customer
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw error
  }
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
) {
  if (!stripe) throw new Error('Stripe not configured')
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    })
    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  if (!stripe) throw new Error('Stripe not configured')
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
    return session
  } catch (error) {
    console.error('Error creating portal session:', error)
    throw error
  }
}

export async function cancelSubscription(subscriptionId: string) {
  if (!stripe) throw new Error('Stripe not configured')
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

export async function retrieveSubscription(subscriptionId: string) {
  if (!stripe) throw new Error('Stripe not configured')
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    throw error
  }
}

export async function constructWebhookEvent(body: string, signature: string) {
  if (!stripe) throw new Error('Stripe not configured')
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured')
  }
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    return event
  } catch (error) {
    console.error('Error constructing webhook event:', error)
    throw error
  }
}
