import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as unknown as {
          id: string;
          status: string;
          current_period_start: number;
          current_period_end: number;
          cancel_at: number | null;
          metadata: Record<string, string>;
        };

        // Update profile
        await supabase
          .from("profiles")
          .update({
            stripe_customer_id: session.customer as string,
            subscription_status: "active",
            subscription_plan: "standard",
          })
          .eq("id", userId);

        // Create/update subscription record
        await supabase
          .from("subscriptions")
          .upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: session.customer as string,
            plan: "standard",
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          }, { onConflict: "user_id" });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subData = event.data.object as unknown as {
        id: string; status: string; current_period_start: number;
        current_period_end: number; cancel_at: number | null; metadata: Record<string, string>;
      };
      const userId = subData.metadata?.userId;

      if (userId) {
        await supabase
          .from("profiles")
          .update({ subscription_status: subData.status })
          .eq("id", userId);

        await supabase
          .from("subscriptions")
          .update({
            status: subData.status,
            current_period_start: new Date(subData.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subData.current_period_end * 1000).toISOString(),
            cancel_at: subData.cancel_at
              ? new Date(subData.cancel_at * 1000).toISOString()
              : null,
          })
          .eq("stripe_subscription_id", subData.id);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as unknown as { id: string };

      await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", subscription.id);

      // Find user by stripe customer and update profile
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", subscription.id)
        .single();

      if (sub) {
        await supabase
          .from("profiles")
          .update({ subscription_status: "canceled" })
          .eq("id", sub.user_id);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as unknown as { subscription: string | null };
      const subscriptionId = invoice.subscription;

      if (subscriptionId) {
        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", subscriptionId);

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (sub) {
          await supabase
            .from("profiles")
            .update({ subscription_status: "past_due" })
            .eq("id", sub.user_id);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
