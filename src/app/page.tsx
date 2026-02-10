import Link from "next/link";
import { Scale, Sparkles, FileText, Calendar, Shield, ArrowRight, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-primary">Docketra</span>
          </div>
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

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-6">
          <Sparkles className="h-4 w-4" />
          AI-Powered Legal Practice Management
        </div>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
          Your virtual associate,{" "}
          <span className="text-primary">always on call</span>
        </h1>
        <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
          Docketra helps solo practitioners manage cases, draft documents, track
          time, and bill clients — all with an AI assistant that knows your
          practice inside and out.
        </p>
        <div className="flex items-center justify-center gap-4 mt-10">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Sparkles,
              title: "AI Document Drafting",
              description:
                "Draft motions, letters, and contracts in seconds. Your AI assistant knows legal formatting and your client details.",
            },
            {
              icon: FileText,
              title: "Smart Document Management",
              description:
                "Upload, organize, and search all your documents. OCR scans paper files. Auto-sync with Google Drive and Dropbox.",
            },
            {
              icon: Users,
              title: "Client & Case Management",
              description:
                "Keep every client and case organized with detailed profiles, linked documents, and complete timelines.",
            },
            {
              icon: Calendar,
              title: "Court Dates & Deadlines",
              description:
                "Never miss a deadline. Get reminders for court dates, filing deadlines, and statute of limitations.",
            },
            {
              icon: Clock,
              title: "Time Tracking & Billing",
              description:
                "Track billable hours with a built-in timer. Generate professional invoices in one click.",
            },
            {
              icon: Shield,
              title: "Bank-Level Security",
              description:
                "Your data is encrypted and protected with row-level security. HIPAA-conscious design for attorney-client privilege.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow"
            >
              <div className="rounded-lg bg-primary/5 w-10 h-10 flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Scale className="h-4 w-4" />
            <span>Docketra</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Docketra. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
