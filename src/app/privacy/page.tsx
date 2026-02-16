import Link from "next/link";
import { Scale, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - Docketra",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-8">
          Last updated: February 13, 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Docketra (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting the privacy
              of our users. This Privacy Policy explains how we collect, use, store, and protect your
              information when you use our legal practice management platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We collect information that you provide directly to us:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Account information (name, email, firm details, bar number)</li>
              <li>Client and case data you enter into the platform</li>
              <li>Documents you upload or create</li>
              <li>Billing and payment information (processed securely via Stripe)</li>
              <li>Calendar events and time tracking entries</li>
              <li>Usage data and interaction logs for improving the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Provide, maintain, and improve the Service</li>
              <li>Process transactions and send related notifications</li>
              <li>Send daily digest emails and deadline reminders (opt-in only)</li>
              <li>Provide AI-powered features such as document drafting assistance</li>
              <li>Respond to your requests and support inquiries</li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your data, including encryption
              in transit (TLS) and at rest, secure authentication, and role-based access controls. Your
              data is stored in SOC 2 compliant infrastructure. We understand the attorney-client privilege
              implications of the data you store and treat all client data with the highest level of
              confidentiality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell, rent, or share your personal data or client data with third parties except:
              when required by law, to process payments (via Stripe), to provide cloud integrations you
              explicitly authorize (Google Drive, Dropbox), or with your explicit consent. AI features
              process data securely and do not retain your content for model training.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your data for as long as your account is active. When you delete your account,
              all associated data is permanently deleted from our systems within 30 days. We may retain
              anonymized, aggregated data for analytics purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Access and export your data at any time</li>
              <li>Correct inaccurate information in your profile</li>
              <li>Delete your account and all associated data</li>
              <li>Opt out of non-essential communications</li>
              <li>Request information about how your data is processed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Cookies & Analytics</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies for authentication and session management. We may use analytics
              tools to understand how the Service is used. You can configure cookie preferences in your
              browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is not intended for use by individuals under the age of 18. We do not knowingly
              collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of material changes
              via email or in-app notification at least 30 days before they take effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy-related questions or data requests, contact us at{" "}
              <a href="mailto:privacy@docketra.org" className="text-primary hover:underline">
                privacy@docketra.org
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
