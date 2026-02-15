import Link from "next/link";
import { Scale, Mail, ArrowLeft, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ContactPage() {
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

      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold tracking-tight">Contact Us</h1>
          <p className="text-lg text-muted-foreground mt-4">
            We&apos;re here to help. Reach out with questions, feedback, or support requests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="rounded-lg bg-primary/5 w-10 h-10 flex items-center justify-center mb-2">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Email Support</CardTitle>
              <CardDescription>
                Send us an email and we&apos;ll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:support@docketra.com"
                className="text-primary hover:underline font-medium"
              >
                support@docketra.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="rounded-lg bg-primary/5 w-10 h-10 flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Response Time</CardTitle>
              <CardDescription>
                We aim to respond to all inquiries within one business day.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monday - Friday, 9 AM - 6 PM EST
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <div className="rounded-lg bg-primary/5 w-10 h-10 flex items-center justify-center mb-2">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Beta Feedback</CardTitle>
              <CardDescription>
                We&apos;re currently in beta and your feedback is invaluable. Let us know what&apos;s working,
                what&apos;s not, and what features you&apos;d like to see.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:feedback@docketra.com"
                className="text-primary hover:underline font-medium"
              >
                feedback@docketra.com
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
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
