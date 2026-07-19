import { ArrowRight, BookOpen, Gauge, PlayCircle } from "lucide-react";
import Link from "next/link";
import { createPageMetadata } from "@/lib/metadata";
import { getCustomerDocsByCategory } from "@/lib/clipstitchr/docs/getCustomerDocsByCategory";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `Docs | ${site.name}`,
  description:
    "Plain ClipStitchr docs for turning saved clips into ads, writing better hooks, reusing Ideas, and checking limits.",
  canonical: "/docs",
});

export default function DocsIndexPage() {
  const startDocs = getCustomerDocsByCategory("start");
  const featureDocs = getCustomerDocsByCategory("feature");
  const limitDocs = getCustomerDocsByCategory("limits");
  const docCount = startDocs.length + featureDocs.length + limitDocs.length;

  return (
    <div className="docs-index-page">
      <div className="docs-index-inner">
        <header className="docs-index-hero">
          <p>{docCount} plain-language field notes</p>
          <h1 className="marketing-heading">Find your next step.</h1>
          <div>
            <strong>ClipStitchr field manual</strong>
            <p>
              Most people should add a product demo, upload a few clips, and
              make finished ads first. Use the other guides when you need
              better hooks, a cleaner clip, a reusable setup, more source
              material, or a carousel instead.
            </p>
          </div>
        </header>

        <section className="docs-start-section">
          <h2>Start here.</h2>
          <div className="docs-start-grid">
            {startDocs.map((doc, index) => (
              <Link
                key={doc.slug}
                href={`/docs/${doc.slug}`}
                className="docs-start-card"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <PlayCircle aria-hidden />
                <h3>{doc.title}</h3>
                <p>{doc.summary}</p>
                <strong>
                  Open guide <ArrowRight aria-hidden />
                </strong>
              </Link>
            ))}

            {limitDocs.map((doc, index) => (
              <Link
                key={doc.slug}
                href={`/docs/${doc.slug}`}
                className="docs-start-card docs-limits-card"
              >
                <span>
                  {String(startDocs.length + index + 1).padStart(2, "0")}
                </span>
                <Gauge aria-hidden />
                <h3>{doc.title}</h3>
                <p>{doc.summary}</p>
                <strong>
                  View limits <ArrowRight aria-hidden />
                </strong>
              </Link>
            ))}
          </div>
        </section>

        <section className="docs-manual-section">
          <div className="docs-manual-heading">
            <h2 className="marketing-heading">
              Choose the guide for the job in front of you.
            </h2>
            <p>What helps the next ad</p>
          </div>
          <nav className="docs-manual-index" aria-label="Feature guides">
            {featureDocs.map((doc, index) => (
              <Link
                key={doc.slug}
                href={`/docs/${doc.slug}`}
                className="docs-manual-row"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <BookOpen aria-hidden />
                <h3>{doc.title}</h3>
                <p>{doc.summary}</p>
                <ArrowRight aria-hidden />
              </Link>
            ))}
          </nav>
        </section>
      </div>
    </div>
  );
}
