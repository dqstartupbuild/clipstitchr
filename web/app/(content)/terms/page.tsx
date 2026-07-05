import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Terms of Use | ${site.name}`,
  description: `Terms for using ${site.name}, including browser video processing, user responsibility for uploaded media, and MVP service limits.`,
  canonical: "/terms",
});

export default function TermsPage() {
  const lastUpdated = "June 26, 2026";

  return (
    <article className="marketing-grid-bg px-6 py-20 md:py-28">
      <div className="marketing-card mx-auto max-w-3xl p-6 md:p-10">
        <header className="mb-12">
          <p className="marketing-eyebrow mb-5">
            Legal
          </p>
          <h1 className="marketing-heading mb-4 text-5xl text-text-primary md:text-7xl">
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
              {site.name} provides an MVP for uploading Hook/UGC clips
              and product demo videos, normalizing them to TikTok-ready 9:16,
              previewing Hook/UGC-then-demo sequences, and creating downloadable
              MP4 files. Media processing runs in the browser, while saved
              media and metadata use backend storage. The Site also provides
              articles and resources.
            </p>
          </section>

          <section>
            <h2>Use of the Site</h2>
            <p>
              You agree to use the Site only for lawful purposes and in a manner
              that does not:
            </p>
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
            <h2>Your Uploaded Media</h2>
            <p>
              You are responsible for the videos you upload, process, stitch,
              and download. You must have the rights and permissions needed to
              use any UGC, product demos, audio, trademarks, or other
              content included in those files.
            </p>
            <p>
              Only add sounds you are allowed to use in your videos.
            </p>
          </section>

          <section>
            <h2>Browser Processing Limits</h2>
            <p>
              Video processing for the MVP happens in your browser and depends
              on your device, browser codec support, and available memory. We do
              not guarantee that every video file can be decoded, encoded,
              stitched, stored, or downloaded successfully.
            </p>
          </section>

          <section>
            <h2>Intellectual Property</h2>
            <p>
              Site content, brand assets, design elements, and documentation
              are the property of {site.name} or its licensors and are protected
              by applicable intellectual property laws.
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
