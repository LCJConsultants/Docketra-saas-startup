import Link from "next/link";
import { Scale, Check, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  "Unlimited cases & clients",
  "AI-powered document drafting",
  "Smart document management with OCR",
  "Time tracking & invoicing",
  "Court dates & deadline reminders",
  "Google Drive & Gmail integration",
  "Calendar sync",
  "Template library & file upload",
  "Bank-level data encryption",
  "Priority email support",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-primary">Docketra</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
            Everything you need to run your practice, powered by AI. One plan, no surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Beta Plan */}
          <Card className="border-primary/50 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="gap-1">
                <Sparkles className="h-3 w-3" />
                Limited Beta
              </Badge>
            </div>
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl">Beta Access</CardTitle>
              <CardDescription>
                Join our early adopter program
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">Free</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Full access during beta period
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Link href="/signup" className="w-full block">
                  <Button className="w-full gap-2">
                    Join Beta <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  No credit card required during beta
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Standard Plan (Post-Beta) */}
          <Card>
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl">Professional</CardTitle>
              <CardDescription>
                Full platform after beta launch
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$200</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                + one-time setup fee
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Button variant="outline" className="w-full" disabled>
                  Coming After Beta
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Beta testers get preferred pricing at launch
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ / Info */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Questions about pricing?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact us
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
