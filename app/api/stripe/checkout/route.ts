import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe, PLANS, PlanKey } from '@/lib/stripe/client';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan } = await req.json();
  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const user = await currentUser();
  const planConfig = PLANS[plan as PlanKey];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    customer_email: user?.emailAddresses[0]?.emailAddress,
    metadata: { userId, plan },
    success_url: `${appUrl}/settings?upgraded=true`,
    cancel_url: `${appUrl}/settings`,
  });

  return NextResponse.json({ url: session.url });
}
