import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { supportEmail } from "@/lib/supportEmail";

export const metadata: Metadata = createPageMetadata({
  title: `Terms of Use | ${site.name}`,
  description: `Terms for using ${site.name}, including browser video processing, user responsibility for uploaded media, and MVP service limits.`,
  canonical: "/terms",
});

export default function TermsPage() {
  const lastUpdated = "July 16, 2026";

  return (
    <article className="legal-page">
      <div className="legal-document">
        <header className="legal-header">
          <p>Legal / Last updated {lastUpdated}</p>
          <h1 className="marketing-heading">Terms of Use</h1>
        </header>

        <div className="prose-legal">
          <section>
            <h2>Agreement to Terms</h2>
            <p>
              By accessing or using the {site.name} website located at{" "}
              <strong>{site.url}</strong> (the &quot;Site&quot;), you agree to
              be bound by these Terms of Use. If you do not agree to these
              terms, please do not use the Site.
            </p>
          </section>

          <section>
            <h2>Description of Service</h2>
            <p>
              {site.name} provides an MVP for uploading Hook/UGC clips and
              product demo videos, normalizing them to TikTok-ready 9:16,
              previewing Hook/UGC-then-demo sequences, and creating downloadable
              MP4 files. Media processing runs in the browser, while saved media
              and metadata use backend storage. The Site also provides Hook Lab,
              which can study text, your saved Stitches, and public TikTok or
              Instagram posts to help you make a fresh creative Idea. The Site
              also provides articles and free planning tools. Those tools do not
              create a free ClipStitchr account or subscription.
            </p>
          </section>

          <section>
            <h2>Public Tools</h2>
            <p>
              Public tools such as the Ad Variant Calculator, hook resources,
              briefs, courses, worksheets, blueprints, economics calculators,
              and local media tools are provided for planning and inspiration.
              Calculator results are arithmetic based on the assumptions you
              enter, not financial forecasts, spend recommendations, or
              performance promises. Writing and test guidance may be incomplete,
              inaccurate, or unsuitable for your app. Video checks describe
              ClipStitchr&apos;s production baseline or combine technical facts
              with your self-review; they do not verify content, usage rights,
              or acceptance by every advertising network. You are responsible
              for reviewing every result before using it.
            </p>
            <p>
              Do not enter confidential information, personal data about other
              people, trade secrets, or claims you do not have the right to use.
              You remain responsible for the accuracy of your advertising and
              for following the rules that apply to your app, audience, and
              marketing channels.
            </p>
            <p>
              Platform specifications and obstruction overlays are dated
              references, not permanent certification. Usage-rights questions,
              creator quote comparisons, and handoff templates are not legal or
              financial advice. Local media findings and content-audit scores
              still require your review.
            </p>
            <p>
              Joining the mailing list does not create a ClipStitchr account.
              You can unsubscribe from marketing emails at any time.
            </p>
            <p>
              Some optional tool extras unlock in that browser after an accepted
              name-and-email form. This browser access is not a product account
              or paid entitlement. A new or previously opted-out address must
              confirm before marketing emails begin, and each email course or
              workshop requires its own clear enrollment request and email
              confirmation. A regular tool signup never unlocks a course.
              Confirmed courses may save checklist progress and notes across
              devices without creating a product account. Unsubscribing stops
              future course emails and later releases but does not remove
              browser value or course work already released.
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
              <li>Restrict or inhibit any other user from using the Site</li>
              <li>Introduce viruses, malware, or other harmful code</li>
              <li>
                Attempt to gain unauthorized access to any portion of the Site
                or its systems
              </li>
              <li>
                Use automated tools to scrape, crawl, or otherwise extract data
                from the Site without permission
              </li>
            </ul>
          </section>

          <section>
            <h2>Your Uploaded Media</h2>
            <p>
              You are responsible for the videos you upload, process, stitch,
              and download. You must have the rights and permissions needed to
              use any UGC, product demos, audio, trademarks, or other content
              included in those files.
            </p>
            <p>Only add sounds you are allowed to use in your videos.</p>
            <p>
              If you give Hook Lab a social post link, you confirm that the post
              is public and that your use is lawful. Do not use private,
              login-only, stolen, or unlawfully shared content. You remain
              responsible for checking whether your finished work respects
              copyright, trademark, publicity, privacy, platform, advertising,
              and other applicable rules.
            </p>
            <p>
              Hook Lab may make protected temporary working copies of the source
              video while it creates the analysis. Those copies are deleted
              after processing and are not added to your Library.
            </p>
            <p>
              You may not use Hook Lab to impersonate someone, clone a person’s
              identity or voice, remove watermarks, or unlawfully reproduce a
              source post.
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
            <h2>Plan and Usage Terms</h2>
            <p>
              The plan limits and prices shown when you subscribe are part of
              your paid plan. Prices are in U.S. dollars. Product limits,
              monthly creation credits, Clipr and Swapr video allowances, and
              daily-draft access vary by plan. Storage is not sold as a
              separate plan allowance.
            </p>
            <p>
              Starter and Pro use 10 creation credits for each stitch that is
              successfully created. This applies to batch creation, daily
              drafts, Normal mode, and Longr mode. Creating 10 stitches uses 100
              credits. Downloading or exporting an existing stitch does not use
              credits again. Agency includes unlimited stitch creation.
            </p>
            <p>
              One Swipr generation uses 20 creation credits. A standalone avatar
              photo, background, or photo expansion uses 25 creation credits.
              Clipr and Swapr videos use the separate video allowance included
              with the plan. A photo that Clipr must create as part of its video
              process does not use standalone photo credits. Credits or video
              allowances reserved for a failed generation are returned.
            </p>
          </section>

          <section>
            <h2>Billing and Automatic Renewal</h2>
            <p>
              Paid subscriptions are billed monthly in U.S. dollars and renew
              automatically each month until canceled. At each renewal, you
              authorize us and Stripe to charge your saved payment method for
              the plan&apos;s then-current monthly price plus any applicable
              taxes shown at checkout or on the invoice.
            </p>
            <p>
              We will send at least 30 days&apos; notice to your account email
              before a price increase applies to a future renewal. You can
              cancel before that renewal if you do not agree to the new price.
            </p>
          </section>

          <section>
            <h2>Plan Changes and Cancellation</h2>
            <p>
              You can cancel from <strong>Settings</strong> under
              <strong> Billing &amp; invoices</strong>. There is no cancellation
              fee. A cancellation takes effect at the end of the current paid
              billing period, and plan access continues through that date.
            </p>
            <p>
              A paid upgrade takes effect immediately after Stripe successfully
              collects the prorated amount shown when you confirm the change. A
              downgrade takes effect at the next monthly renewal, so the
              current plan and limits stay in place until then.
            </p>
          </section>

          <section>
            <h2>Failed Payments and Renewal Grace</h2>
            <p>
              If the first subscription payment fails, paid plan access does
              not begin. If a renewal payment fails after a successful paid
              period, the account receives a 72-hour payment grace period. The
              first failed renewal starts that deadline, and payment retries do
              not extend it. Access may continue during the grace period and
              will stop if payment is not recovered before it ends. A
              successful recovery restores paid access.
            </p>
          </section>

          <section>
            <h2>Monthly Credits and Credit Refills</h2>
            <p>
              Monthly creation credits expire at the end of each monthly
              billing period and do not roll over. Monthly credits are used
              before refill credits.
            </p>
            <p>
              A one-time $29 credit refill adds 2,000 creation credits. You
              must have a paid ClipStitchr subscription when you buy a refill.
              Refill credits are usable only while the subscription that bought
              them remains active or in its valid renewal-payment grace period.
              Cancellation, expiration, or replacement of that subscription
              ends access to its unused refill balance, even if you later start
              another subscription. Otherwise, refill credits expire 12 months
              after payment. They do not add any Clipr or Swapr videos, are
              nontransferable, cannot be resold, and have no cash value.
            </p>
          </section>

          <section>
            <h2>Refunds</h2>
            <p>
              Payments are generally final. You may ask us to consider an
              exception by emailing{" "}
              <a href={`mailto:${supportEmail}`}>{supportEmail}</a> within 14
              days after the charge. A request does not guarantee a refund. We
              do not ordinarily provide prorated refunds or credits for a
              cancellation, downgrade, unused time, or unused capacity. The
              immediate paid-upgrade calculation described above is separate
              from this refund policy.
            </p>
            <p>
              An approved refund removes the unused credits or other unused
              plan capacity granted by the refunded payment. Nothing in this
              section limits refund or cancellation rights that applicable law
              requires.
            </p>
          </section>

          <section>
            <h2>10k Organic Views Challenge</h2>
            <p>
              The 10k Organic Views Challenge is an optional promotional account
              credit, not a promise that your posts will receive a particular
              number of views. An eligible paid customer who publishes 30
              ClipStitchr-made public posts in 30 consecutive days and receives
              fewer than 10,000 total organic views may request one free month
              of their then-current plan.
            </p>
            <p>
              Eligible posts may be published on TikTok, Instagram Reels, or
              YouTube Shorts. Paid boosting and paid distribution do not count.
              The customer must submit public post links or platform analytics
              screenshots within 7 days after the 30-day challenge period ends.
              The account must remain in good standing. The free month applies
              to the next renewal and is not a cash refund of an earlier charge.
              The challenge may be claimed once per customer.
            </p>
          </section>

          <section>
            <h2>Support and Account Messages</h2>
            <p>
              Support is available by email at{" "}
              <a href={`mailto:${supportEmail}`}>{supportEmail}</a>. We do not
              publish or promise a specific support response time or service
              level.
            </p>
            <p>
              We may send receipts, billing notices, security alerts, and other
              service messages to the email address on your account. Keep that
              address current so you receive messages about your subscription
              and account. These required account messages are separate from
              marketing emails.
            </p>
          </section>

          <section>
            <h2>Intellectual Property</h2>
            <p>
              Site content, brand assets, design elements, and documentation are
              the property of {site.name} or its licensors and are protected by
              applicable intellectual property laws.
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
              <li>
                The Site will be available at all times or free from errors
              </li>
              <li>Information on the Site is complete, accurate, or current</li>
            </ul>
          </section>

          <section>
            <h2>Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, {site.name} shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages arising from your use of the Site, even if we
              have been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2>Third-Party Links</h2>
            <p>
              The Site may contain links to third-party websites or services. We
              are not responsible for the content, privacy practices, or
              availability of those third-party sites. Your use of third-party
              sites is governed by their respective terms and policies.
            </p>
          </section>

          <section>
            <h2>Changes to These Terms</h2>
            <p>
              We reserve the right to modify these Terms of Use at any time.
              Changes will be posted on this page with an updated &quot;Last
              updated&quot; date. Your continued use of the Site after changes
              are posted constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2>Governing Law</h2>
            <p>
              These Terms of Use shall be governed by and construed in
              accordance with applicable laws, without regard to conflict of law
              principles.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              If you have questions about these Terms of Use, email us at{" "}
              <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
              .
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
