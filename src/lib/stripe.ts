import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(key, {
      apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion,
      typescript: true,
    });
  }
  return _stripe;
}

// For backwards compatibility
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export async function createCheckoutSession(params: {
  customerId?: string;
  customerEmail: string;
  userId: string;
  returnUrl: string;
}) {
  const s = getStripe();
  const session = await s.checkout.sessions.create({
    customer: params.customerId || undefined,
    customer_email: params.customerId ? undefined : params.customerEmail,
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID || "price_placeholder",
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 14,
      metadata: {
        userId: params.userId,
      },
    },
    metadata: {
      userId: params.userId,
    },
    success_url: `${params.returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${params.returnUrl}?canceled=true`,
  });

  return session;
}

export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  const s = getStripe();
  const session = await s.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}
