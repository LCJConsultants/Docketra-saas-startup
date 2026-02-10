import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, createCustomerPortalSession } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function BillingSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, subscription_status, subscription_plan, email")
    .eq("id", user!.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  const statusColors: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
    active: "success",
    trialing: "info" as "success",
    past_due: "warning",
    canceled: "destructive",
    unpaid: "destructive",
  };

  async function handleSubscribe() {
    "use server";
    const supa = await (await import("@/lib/supabase/server")).createClient();
    const { data: { user: u } } = await supa.auth.getUser();
    const { data: p } = await supa.from("profiles").select("email, stripe_customer_id").eq("id", u!.id).single();

    const session = await createCheckoutSession({
      customerId: p?.stripe_customer_id || undefined,
      customerEmail: p!.email,
      userId: u!.id,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    });

    redirect(session.url!);
  }

  async function handleManage() {
    "use server";
    const supa = await (await import("@/lib/supabase/server")).createClient();
    const { data: { user: u } } = await supa.auth.getUser();
    const { data: p } = await supa.from("profiles").select("stripe_customer_id").eq("id", u!.id).single();

    if (!p?.stripe_customer_id) return;

    const session = await createCustomerPortalSession(
      p.stripe_customer_id,
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`
    );

    redirect(session.url);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Billing" description="Manage your subscription and payment methods" />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>Your current plan and billing status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Plan</p>
              <p className="text-lg font-semibold capitalize">
                {profile?.subscription_plan || "No Plan"}
              </p>
            </div>
            <Badge variant={statusColors[profile?.subscription_status || ""] || "secondary"} className="capitalize">
              {profile?.subscription_status || "none"}
            </Badge>
          </div>

          {subscription && (
            <div className="space-y-2 pt-4 border-t">
              {subscription.current_period_start && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current period</span>
                  <span>
                    {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end!)}
                  </span>
                </div>
              )}
              {subscription.cancel_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cancels on</span>
                  <span className="text-destructive">{formatDate(subscription.cancel_at)}</span>
                </div>
              )}
            </div>
          )}

          <div className="pt-4">
            {!profile?.stripe_customer_id ? (
              <form action={handleSubscribe}>
                <Button type="submit" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Subscribe
                </Button>
              </form>
            ) : (
              <form action={handleManage}>
                <Button type="submit" variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Manage Subscription
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
