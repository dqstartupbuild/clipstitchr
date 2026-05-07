import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Privacy Policy | ${site.name}`,
  description: `Learn how ${site.name} handles your information. Our privacy practices are transparent, straightforward, and designed to respect your data.`,
  canonical: "/privacy",
});

export default function PrivacyPage() {
  const lastUpdated = "January 1, 2026";

  return (
    <article className="px-6 py-20 md:py-28">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <p
            className="uppercase text-xs tracking-[0.2em] font-semibold mb-4"
            style={{ color: "var(--accent)" }}
          >
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4">
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
              <strong>{site.url}</strong>. This Privacy Policy
              explains what information we collect, how we use it, and your
              choices regarding that information.
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
              When you visit our website, standard web server logs may
              record:
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
              <li>Improve our website content and user experience</li>
              <li>Respond to your inquiries or feedback</li>
              <li>Analyze site traffic and usage patterns</li>
            </ul>
          </section>

          <section>
            <h2>Information Sharing</h2>
            <p>
              We do not sell, rent, or trade your personal information. We
              may share information only in the following circumstances:
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
              Our website may use essential cookies for basic functionality.
              We do not use advertising cookies or cross-site tracking
              cookies.
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
