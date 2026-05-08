import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Privacy Policy | ${site.name}`,
  description: `Learn how ${site.name} handles browser-local uploads, IndexedDB video storage, website data, and user privacy for the MVP application.`,
  canonical: "/privacy",
});

export default function PrivacyPage() {
  const lastUpdated = "May 7, 2026";

  return (
    <article className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl rounded-lg border border-border bg-white p-6 shadow-sm md:p-10">
        <header className="mb-12">
          <p className="mb-4 text-sm font-semibold text-accent-dark">
            Legal
          </p>
          <h1 className="mb-4 text-3xl font-bold text-text-primary md:text-5xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-text-tertiary">
            Last updated: {lastUpdated}
          </p>
        </header>

        <div className="prose-legal">
          <section>
            <h2>Overview</h2>
            <p>
              {site.name} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
              operates the website located at{" "}
              <strong>{site.url}</strong>. This Privacy Policy explains what
              information the MVP stores locally in your browser, what website
              data may be processed, and your choices regarding that
              information.
            </p>
          </section>

          <section>
            <h2>Browser-Local Video Storage</h2>
            <p>
              ClipStitchr processes uploaded videos in your browser for the MVP.
              Normalized clips and stitches are saved in your browser
              IndexedDB under the <strong>clipstitchr-mvp</strong> database. We do
              not upload those video files to a ClipStitchr server as part of the MVP.
            </p>
            <p>
              Anyone with access to your browser profile may be able to access
              local ClipStitchr data. You can delete clips in the dashboard or clear
              site data from your browser settings.
            </p>
          </section>

          <section>
            <h2>Information We Collect</h2>

            <h3>Information You Provide</h3>
            <p>
              If you choose to contact us or submit information through our
              website, you may voluntarily provide information such as:
            </p>
            <ul>
              <li>Your name and email address</li>
              <li>Feedback, questions, or other messages</li>
            </ul>

            <h3>Information Collected Automatically</h3>
            <p>
              When you visit our website, standard hosting logs may record:
            </p>
            <ul>
              <li>IP address</li>
              <li>Browser type and operating system</li>
              <li>Pages visited and time spent</li>
              <li>Referring URL</li>
            </ul>
            <p>
              We use this data in aggregate to understand how visitors use
              the site. We do not use this data to identify individuals.
            </p>
          </section>

          <section>
            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Run browser-local video normalization and stitching</li>
              <li>Improve our website content and user experience</li>
              <li>Respond to your inquiries or feedback</li>
              <li>Analyze site traffic and usage patterns</li>
            </ul>
          </section>

          <section>
            <h2>Information Sharing</h2>
            <p>
              We do not sell, rent, or trade your personal information. We may
              share non-video website data only in the following circumstances:
            </p>
            <ul>
              <li>
                <strong>Service providers:</strong> Third-party tools (e.g.,
                hosting, analytics) that help us operate the website, bound
                by their own privacy policies.
              </li>
              <li>
                <strong>Legal requirements:</strong> If required by law,
                regulation, or valid legal process.
              </li>
            </ul>
          </section>

          <section>
            <h2>Cookies</h2>
            <p>
              The MVP does not require an account cookie. Hosting or framework
              infrastructure may use essential storage for basic functionality.
              We do not use advertising cookies or cross-site tracking cookies.
            </p>
          </section>

          <section>
            <h2>Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Opt out of any future communications</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us using the
              information below.
            </p>
          </section>

          <section>
            <h2>Children&apos;s Privacy</h2>
            <p>
              Our website is not directed at children under 13. We do not
              knowingly collect personal information from children. If you
              believe a child has provided us with personal information,
              please contact us and we will promptly delete it.
            </p>
          </section>

          <section>
            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes
              will be posted on this page with an updated &quot;Last
              updated&quot; date. We encourage you to review this page
              periodically.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              If you have questions about this Privacy Policy, you can reach
              us through the contact information provided on our website.
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
