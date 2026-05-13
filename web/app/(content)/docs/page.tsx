import { ArrowRight, BookOpen, Gauge, PlayCircle } from "lucide-react";
import Link from "next/link";
import { createPageMetadata } from "@/lib/metadata";
import { getCustomerDocsByCategory } from "@/lib/clipstitchr/docs/getCustomerDocsByCategory";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `Docs | ${site.name}`,
  description:
    "Simple ClipStitchr docs for getting started, making ad variants, creating source clips, and checking usage limits.",
  canonical: "/docs",
});

export default function DocsIndexPage() {
  const startDocs = getCustomerDocsByCategory("start");
  const featureDocs = getCustomerDocsByCategory("feature");
  const limitDocs = getCustomerDocsByCategory("limits");

  return (
    <div className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-accent-dark">Docs</p>
          <h1 className="mt-4 text-4xl font-bold text-text-primary md:text-5xl">
            Find the guide for what you want to make.
          </h1>
          <p className="mt-6 text-lg leading-8 text-text-secondary">
            Start with the basics, then jump into the feature that matches your
            next post: a finished ad, a fresh Clip, a carousel, or more source
            footage.
          </p>
        </div>

        <section className="mt-12 grid gap-4 md:grid-cols-2">
          {startDocs.map((doc) => (
            <Link
              key={doc.slug}
              href={`/docs/${doc.slug}`}
              className="rounded-lg border border-border bg-white p-7 shadow-sm transition-colors hover:border-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-accent">
                <PlayCircle aria-hidden className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-text-primary">
                {doc.title}
              </h2>
              <p className="mt-3 leading-7 text-text-secondary">
                {doc.summary}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-accent">
                Start here
                <ArrowRight aria-hidden className="h-4 w-4" />
              </span>
            </Link>
          ))}

          {limitDocs.map((doc) => (
            <Link
              key={doc.slug}
              href={`/docs/${doc.slug}`}
              className="rounded-lg border border-border bg-white p-7 shadow-sm transition-colors hover:border-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-accent">
                <Gauge aria-hidden className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-text-primary">
                {doc.title}
              </h2>
              <p className="mt-3 leading-7 text-text-secondary">
                {doc.summary}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-accent">
                View limits
                <ArrowRight aria-hidden className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-accent-dark">Features</p>
            <h2 className="mt-3 text-3xl font-bold text-text-primary">
              Choose what you are making.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featureDocs.map((doc) => (
              <Link
                key={doc.slug}
                href={`/docs/${doc.slug}`}
                className="rounded-lg border border-border bg-white p-6 shadow-sm transition-colors hover:border-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-accent">
                  <BookOpen aria-hidden className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-text-primary">
                  {doc.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  {doc.summary}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-accent">
                  Read guide
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
