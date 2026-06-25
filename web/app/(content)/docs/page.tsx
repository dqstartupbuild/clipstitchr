import { ArrowRight, BookOpen, Gauge, PlayCircle } from "lucide-react";
import Link from "next/link";
import { createPageMetadata } from "@/lib/metadata";
import { getCustomerDocsByCategory } from "@/lib/clipstitchr/docs/getCustomerDocsByCategory";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `Docs | ${site.name}`,
  description:
    "Plain ClipStitchr docs for turning saved clips into ads, writing less fake overlay text, reusing templates, and checking limits.",
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
            Start with the annoying part you want gone.
          </h1>
          <p className="mt-6 text-lg leading-8 text-text-secondary">
            Most people should upload clips, pick the product demo, and make a
            few finished ads first. Use the other guides when you need better
            hooks, a cleaner clip, a reusable setup, more source material, or a
            carousel instead.
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
            <p className="text-sm font-semibold text-accent-dark">
              What helps the next ad
            </p>
            <h2 className="mt-3 text-3xl font-bold text-text-primary">
              Choose the guide for the job in front of you.
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
