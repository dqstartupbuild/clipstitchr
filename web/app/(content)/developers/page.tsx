import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "ClipStitchr Developer Resources",
  description: "Public API, OpenAPI schema, agent guidance, and rate-limit details for ClipStitchr.",
  canonical: "/developers",
});

export default function DevelopersPage() {
  return (
    <article className="legal-page">
      <div className="legal-document">
        <header className="legal-header">
          <p>Developer resources</p>
          <h1 className="marketing-heading">ClipStitchr Developer Resources</h1>
        </header>
        <div className="prose-legal">
        <section>
          <h2>A small public surface for useful app-ad work</h2>
          <p>ClipStitchr has one public REST operation today: generate a set of eight deterministic app-ad hooks. It is useful when an agent or app wants a focused starting set of opening lines for a mobile product campaign, based on a supplied app name, audience, desired outcome, customer problem, writing edge, and variation index. Public endpoints do not need authentication. The authenticated dashboard, saved media, account data, and paid production workflows are not public APIs.</p>
          <p>Start with the <Link href="/openapi.json">OpenAPI 3.1.1 specification</Link> for function-call-ready schemas, then inspect the <Link href="/api/v1">API index</Link> for live capabilities. <Link href="/llms.txt">llms.txt</Link> gives agents a short guide to when ClipStitchr is a good fit, while <Link href="/docs">product docs</Link> explain the people-facing workflow.</p>
        </section>
        <section>
          <h2>Calling the hook endpoint</h2>
          <pre><code>{`curl -X POST ${site.url}/api/v1/hooks \\
  -H 'content-type: application/json' \\
  -d '{"appName":"Focus Timer","audience":"busy students","desiredOutcome":"start a focused session","problem":"procrastination","edgeLevel":"punchy","variationIndex":1}'`}</code></pre>
          <p>The result contains <code>hooks</code> and the submitted <code>variationIndex</code>. Requests share the same per-client quota as the existing public App Hook Generator, so respect a <code>429</code> response and its <code>Retry-After</code> header. Every public API error is JSON in the form <code>{`{"error":{"code":"…","message":"…","resolution":"…"}}`}</code>; use the resolution before retrying. The API index and specification are bounded public reads and are not rate-limited because they do not create provider, storage, or user-specific compute cost.</p>
        </section>
        </div>
      </div>
    </article>
  );
}
