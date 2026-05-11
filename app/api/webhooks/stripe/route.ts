import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      // Update user's plan in your DB or Clerk metadata
      // const sub = event.data.object as Stripe.Subscription;
      break;
    }
    case 'customer.subscription.deleted': {
      // Downgrade user to free tier
      break;
    }
    case 'checkout.session.completed': {
      // Provision subscription
      break;
    }
  }

  return NextResponse.json({ received: true });
}
