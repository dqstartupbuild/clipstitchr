import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { supportEmail } from "@/lib/supportEmail";

export const metadata: Metadata = createPageMetadata({
  title: `Contact | ${site.name}`,
  description: "Contact ClipStitchr customer support for account, billing, and product help.",
  canonical: "/contact",
});

export default function ContactPage() {
  return (
    <article className="legal-page">
      <div className="legal-document">
        <header className="legal-header">
          <p>Contact ClipStitchr</p>
          <h1 className="marketing-heading">
            Help with your clips, account, or plan.
          </h1>
        </header>
        <div className="prose-legal">
        <section>
          <h2>Customer support</h2>
          <p>Email <a href={`mailto:${supportEmail}`}>{supportEmail}</a> for help with signing in, your ClipStitchr plan, billing records, saved media, or a workflow that is not behaving as expected. Include the email on your account, what you were trying to do, and any helpful screen or error details. Please do not send passwords, payment card numbers, private keys, or media you do not have permission to share.</p>
          <p>We can help explain the product, investigate an account issue, and point you to the right public guide. We cannot provide legal advice, guarantee campaign results, or access content that does not belong to the account you identify. For security, we may ask you to confirm account details before discussing private saved work, billing, deletion, or access changes.</p>
        </section>
        <section>
          <h2>Privacy and responsible sharing</h2>
          <p>Keep your message focused on the support question. If an uploaded clip or public social post is relevant, send a link or the smallest useful description first rather than sharing sensitive information by email. Our <a href="/privacy">Privacy Policy</a> explains how uploads, saved media, temporary Hook Lab analysis material, and contact information are handled. It also explains the choices available to you when you want to remove saved work or change marketing email preferences.</p>
          <p>Developers looking for the small public API should read <a href="/developers">ClipStitchr Developer Resources</a>. That page documents the unauthenticated hook endpoint, its shared rate limit, and structured error format. Product dashboard APIs are intentionally not public and support cannot provide credentials for another customer&apos;s workspace.</p>
        </section>
        </div>
      </div>
    </article>
  );
}
