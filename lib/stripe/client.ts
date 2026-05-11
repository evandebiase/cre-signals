import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-04-22.dahlia',
    });
  }
  return _stripe;
}

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 149,
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? '',
    limits: { maxZips: 5, csvExport: false, alerts: false, apiAccess: false, seats: 1 },
  },
  pro: {
    name: 'Pro',
    price: 399,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? '',
    limits: { maxZips: 50, csvExport: true, alerts: true, apiAccess: false, seats: 1 },
  },
  team: {
    name: 'Team',
    price: 799,
    priceId: process.env.STRIPE_TEAM_PRICE_ID ?? '',
    limits: { maxZips: -1, csvExport: true, alerts: true, apiAccess: true, seats: 5 },
  },
} as const;

export type PlanKey = keyof typeof PLANS;
export type PlanLimits = typeof PLANS[PlanKey]['limits'];

export function getPlanFromPriceId(priceId: string): PlanKey {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) return key as PlanKey;
  }
  return 'starter';
}
