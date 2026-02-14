import Link from "next/link";
import { Scale, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service - Docketra",
};

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-8">
          Last updated: February 13, 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Docketra (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, do not use the Service. The Service is intended for licensed
              attorneys and legal professionals.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Docketra is an AI-powered legal practice management platform that provides case management,
              document drafting, billing, calendar management, and related tools for solo attorneys and small firms.
              The Service is a practice management aid and does not constitute legal advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials.
              You must provide accurate information when creating your account. You are solely responsible
              for all activity under your account. Notify us immediately of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Ownership & Confidentiality</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain full ownership of all data you upload or create in the Service, including client
              information, case files, documents, and communications. We do not claim any ownership rights
              over your content. We understand the sensitive nature of legal data and maintain strict
              confidentiality in accordance with applicable regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. AI-Generated Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service includes AI-powered features for document drafting and analysis. AI-generated
              content is provided as a starting point and must be reviewed, verified, and approved by a
              licensed attorney before use. Docketra is not responsible for the accuracy, completeness,
              or legal sufficiency of AI-generated content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to misuse the Service, including but not limited to: attempting to gain
              unauthorized access to other accounts, interfering with the Service&apos;s infrastructure,
              using the Service for any unlawful purpose, or reselling access without authorization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Billing & Subscriptions</h2>
            <p className="text-muted-foreground leading-relaxed">
              Paid features are billed on a subscription basis. You will be charged at the beginning of
              each billing cycle. You may cancel your subscription at any time; access continues until
              the end of the current billing period. Refunds are provided in accordance with our refund policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided &quot;as is&quot; without warranties of any kind. Docketra shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages arising from your
              use of the Service. Our total liability shall not exceed the amount you paid for the Service
              in the twelve months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Account Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may delete your account at any time through the Settings page. Upon deletion, all your
              data will be permanently removed. We reserve the right to suspend or terminate accounts
              that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms from time to time. We will notify you of material changes via
              email or in-app notification. Continued use of the Service after changes constitutes
              acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, contact us at{" "}
              <a href="mailto:legal@docketra.com" className="text-primary hover:underline">
                legal@docketra.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
