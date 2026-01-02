import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import stripe from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import type { Stripe } from 'stripe'

export async function POST(req: Request) {
  if (!stripe || !supabase) {
    return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
  }

  const body = await req.text()
  const signature = (await headers()).get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: unknown) {
    console.error('Webhook signature verification failed:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        await handleCheckoutSessionCompleted(session)
        break
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        await handleInvoicePaymentSucceeded(invoice)
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object
        await handleInvoicePaymentFailed(invoice)
        break
      }
      case 'customer.subscription.created': {
        const subscription = event.data.object
        await handleSubscriptionCreated(subscription)
        break
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        await handleSubscriptionUpdated(subscription)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        await handleSubscriptionDeleted(subscription)
        break
      }
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer
  const subscriptionId = session.subscription
  const userId = session.metadata?.user_id

  if (!userId) {
    console.error('No user_id in session metadata')
    return
  }

  // Update or create subscription record
  const subscriptionData = {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    status: 'active',
    price_id: session.line_items?.data[0]?.price?.id || '',
    quantity: 1,
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    trial_end: null,
    cancel_at_period_end: false,
  }

  if (supabase) {
    const { error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' })

    if (error) {
      console.error('Error creating subscription:', error)
    }
  }

  // Update user profile with customer ID
  if (supabase) {
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId)
  }

  console.log(`Checkout session completed for user ${userId}`)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription || (invoice as any).subscription?.id
  const customerId = invoice.customer

  if (!subscriptionId) {
    console.error('No subscription ID in invoice')
    return
  }

  // Update subscription status to active
  if (supabase) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_start: new Date(invoice.period_start * 1000).toISOString(),
        current_period_end: new Date(invoice.period_end * 1000).toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) {
      console.error('Error updating subscription:', error)
    }
  }

  console.log(`Invoice payment succeeded for subscription ${subscriptionId}`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription || (invoice as any).subscription?.id

  if (!subscriptionId) {
    console.error('No subscription ID in invoice')
    return
  }

  // Update subscription status to past_due
  if (supabase) {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) {
      console.error('Error updating subscription:', error)
    }
  }

  console.log(`Invoice payment failed for subscription ${subscriptionId}`)
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  // Find user by customer ID
  if (!supabase) {
    console.error('Supabase not configured')
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    console.error('No profile found for customer:', customerId)
    return
  }

  // Update subscription record
  const subscriptionData = {
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: customerId,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    quantity: subscription.items.data[0].quantity,
    current_period_start: new Date((subscription as any).current_period_start! * 1000).toISOString(),
    current_period_end: new Date((subscription as any).current_period_end! * 1000).toISOString(),
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
  }

  if (supabase) {
    const { error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' })

    if (error) {
      console.error('Error upserting subscription:', error)
    }
  }

  console.log(`Subscription created for user ${profile.id}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Update subscription record
  if (supabase) {
    const subscriptionData = {
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start! * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end! * 1000).toISOString(),
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
    }

    const { error } = await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error updating subscription:', error)
    }
  }

  console.log(`Subscription updated: ${subscription.id}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Update subscription status to cancelled
  if (supabase) {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error updating subscription:', error)
    }
  }

  console.log(`Subscription deleted: ${subscription.id}`)
}
