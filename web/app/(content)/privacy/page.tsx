import type { Metadata } from "next";
import { CookiePreferencesButton } from "@/app/_components/privacy/CookiePreferencesButton";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Privacy Policy | ${site.name}`,
  description: `Learn what ${site.name} collects, how uploaded clips and demos are handled, where saved media lives, and the privacy choices you have.`,
  canonical: "/privacy",
});

export default function PrivacyPage() {
  const lastUpdated = "July 12, 2026";

  return (
    <article className="marketing-grid-bg px-6 py-20 md:py-28">
      <div className="marketing-card mx-auto max-w-3xl p-6 md:p-10">
        <header className="mb-12">
          <p className="marketing-eyebrow mb-5">
            Legal
          </p>
          <h1 className="marketing-heading mb-4 text-5xl text-text-primary md:text-7xl">
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
              <strong>{site.url}</strong>. This Privacy Policy explains what we
              collect, how uploads are handled, and the choices you have.
            </p>
          </section>

          <section>
            <h2>Media Processing and Storage</h2>
            <p>
              ClipStitchr processes uploaded videos and photos in your browser
              when normalizing, previewing, stitching, or preparing media. Saved
              media files are stored in Cloudflare R2, and related metadata such
              as names, tags, trim ranges, and object references is stored in
              Convex.
            </p>
            <p>
              Your browser may cache generated poster and thumbnail preview
              images to make library pages load faster. Clearing browser or site
              data removes that local preview cache.
            </p>
            <p>
              Sounds you add are used to help you make and export your own
              clips and stitches.
            </p>
            <p>
              Hook Lab can learn from text you paste, one of your saved
              Stitches, or a public TikTok or Instagram post you choose. We
              send that source to our processing providers so they can find a
              reusable writing pattern and visual idea.
            </p>
            <p>
              For a public social post, Apify retrieves the public post details
              and a temporary video link when one is available. Our worker
              downloads the video only for analysis and deletes its temporary
              copy whether the analysis works or fails. We may keep the public
              post link, creator attribution, extracted text, a private preview
              image, and the reusable Idea in your account until you remove it.
              We do not use Hook Lab to save or repost the source video.
            </p>
            <p>
              You can delete clips, photos, and stitches in the dashboard. Those
              actions remove the saved record and associated media objects for
              your account.
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
              If you allow optional cookies, we may also remember a random
              visitor ID, your session, the page you landed on, where you came
              from, campaign links, ad click IDs, and events such as waitlist
              sign-ups, uploads, exports, AI generation requests, or future
              purchases.
            </p>
            <p>
              If analytics cookies are on, we use PostHog to understand how
              people move through the landing pages and dashboard. When you are
              signed in, PostHog may receive your account ID, email, and name so
              we can connect activity to the right account and support the
              product better.
            </p>
            <p>
              If marketing cookies are on, we may also send TikTok a hashed
              version of your email or account ID when you join the waitlist or
              sign in. Hashing means TikTok does not receive the plain email or
              ID from us.
            </p>
            <p>
              We use this to understand what is working and improve the site.
              We do not use optional cookie data unless you allow it.
            </p>
          </section>

          <section>
            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Run video normalization and stitching workflows</li>
              <li>Improve our website content and user experience</li>
              <li>Respond to your inquiries or feedback</li>
              <li>Understand how people use the site</li>
              <li>See which pages and ads are working</li>
            </ul>
          </section>

          <section>
            <h2>Information Sharing</h2>
            <p>
              We do not sell, rent, or trade your personal information. We may
              share account information or media only in the following
              circumstances:
            </p>
            <ul>
              <li>
                <strong>Service providers:</strong> Third-party tools (e.g.,
                hosting, storage, analytics, Apify, and AI processing) that help
                us run the features you request, subject to their own privacy
                policies and terms.
              </li>
              <li>
                <strong>Ad tools:</strong> If you allow marketing cookies, we
                may share website events with TikTok so we can see whether our
                ads are working.
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
              Clerk authentication uses essential cookies and storage to keep you
              signed in. Hosting or framework infrastructure may use essential
              storage for basic functionality.
            </p>
            <p>
              ClipStitchr also uses a required cookie to remember your cookie
              choice. Required cookies cannot be turned off because they keep
              sign-in, security, and the site itself working.
            </p>
            <p>
              If you allow optional cookies, we use them to understand visits,
              remember where visitors came from, measure sign-ups or future
              purchases, and see which dashboard features people use most. If
              you allow marketing cookies, we may load the TikTok Pixel and send
              server-side TikTok events to help measure ads. TikTok may receive
              hashed contact or account details for matching when marketing
              cookies are on.
            </p>
            <CookiePreferencesButton />
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
