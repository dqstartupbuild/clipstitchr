import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Terms of Use | ${site.name}`,
  description: `Terms and conditions for using the ${site.name} website. Simple, fair terms for all visitors and users of our service.`,
  canonical: "/terms",
});

export default function TermsPage() {
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
            Terms of Use
          </h1>
          <p className="text-sm text-text-tertiary">
            Last updated: {lastUpdated}
          </p>
        </header>

        <div className="prose-legal">
          <section>
            <h2>Agreement to Terms</h2>
            <p>
              By accessing or using the {site.name} website located at{" "}
              <strong>{site.url}</strong> (the &quot;Site&quot;), you agree
              to be bound by these Terms of Use. If you do not agree to
              these terms, please do not use the Site.
            </p>
          </section>

          <section>
            <h2>Description of Service</h2>
            <p>
              {site.name} operates an informational website and blog. The
              Site provides articles, guides, and resources. Our offerings
              may evolve over time as we develop new products and services.
            </p>
          </section>

          <section>
            <h2>Use of the Site</h2>
            <p>You agree to use the Site only for lawful purposes and in a manner that does not:</p>
            <ul>
              <li>Infringe upon the rights of others</li>
              <li>
                Restrict or inhibit any other user from using the Site
              </li>
              <li>
                Introduce viruses, malware, or other harmful code
              </li>
              <li>
                Attempt to gain unauthorized access to any portion of the
                Site or its systems
              </li>
              <li>
                Use automated tools to scrape, crawl, or otherwise extract
                data from the Site without permission
              </li>
            </ul>
          </section>

          <section>
            <h2>Intellectual Property</h2>
            <p>
              All content on the Site — including text, images, graphics,
              logos, and design elements — is the property of {site.name} or
              its licensors and is protected by applicable intellectual
              property laws. You may not reproduce, distribute, or create
              derivative works from this content without explicit written
              permission.
            </p>
          </section>

          <section>
            <h2>User-Submitted Content</h2>
            <p>
              By submitting content through the Site, you grant {site.name} a
              non-exclusive, royalty-free, perpetual license to use that
              content for product development, research, and marketing
              purposes.
            </p>
          </section>

          <section>
            <h2>Disclaimer of Warranties</h2>
            <p>
              The Site is provided on an &quot;as is&quot; and &quot;as
              available&quot; basis without warranties of any kind, either
              express or implied. We do not warrant that:
            </p>
            <ul>
              <li>The Site will be available at all times or free from errors</li>
              <li>
                Information on the Site is complete, accurate, or current
              </li>
            </ul>
          </section>

          <section>
            <h2>Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, {site.name} shall not
              be liable for any indirect, incidental, special, consequential,
              or punitive damages arising from your use of the Site, even if
              we have been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2>Third-Party Links</h2>
            <p>
              The Site may contain links to third-party websites or services.
              We are not responsible for the content, privacy practices, or
              availability of those third-party sites. Your use of
              third-party sites is governed by their respective terms and
              policies.
            </p>
          </section>

          <section>
            <h2>Changes to These Terms</h2>
            <p>
              We reserve the right to modify these Terms of Use at any time.
              Changes will be posted on this page with an updated &quot;Last
              updated&quot; date. Your continued use of the Site after
              changes are posted constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2>Governing Law</h2>
            <p>
              These Terms of Use shall be governed by and construed in
              accordance with applicable laws, without regard to conflict of
              law principles.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              If you have questions about these Terms of Use, you can reach
              us through the contact information provided on our website.
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
