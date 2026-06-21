import { MDXContent } from "@content-collections/mdx/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudyFeatureImage } from "@/app/_components/case-studies/CaseStudyFeatureImage";
import { CaseStudyHeroMetric } from "@/app/_components/case-studies/CaseStudyHeroMetric";
import {
  getCaseStudyBySlug,
  getPublishedCaseStudies,
} from "@/lib/content/caseStudyQueries";
import { mdxComponents } from "@/lib/content/mdx-components";
import {
  createArticleJsonLd,
  createContentMetadata,
  createFaqJsonLd,
} from "@/lib/content/seo";

type CaseStudyPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPublishedCaseStudies().map((caseStudy) => ({
    slug: caseStudy.slug,
  }));
}

export async function generateMetadata({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);

  if (!caseStudy) {
    return {};
  }

  return createContentMetadata(caseStudy);
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);

  if (!caseStudy) {
    notFound();
  }

  const structuredData = [
    createArticleJsonLd(caseStudy),
    createFaqJsonLd(caseStudy),
  ].filter(Boolean);

  return (
    <div className="px-6 py-16 md:py-24">
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}

      <div className="mx-auto max-w-6xl">
        <Link
          href="/case-studies"
          className="text-sm font-semibold text-text-tertiary hover:text-accent"
        >
          Back to case studies
        </Link>

        <header className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-start">
          <div>
            <p className="text-sm font-semibold text-accent-dark">
              {caseStudy.companyName} case study
            </p>
            <h1 className="mt-4 text-4xl font-bold text-text-primary md:text-5xl">
              {caseStudy.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-text-secondary">
              {caseStudy.description}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
              {caseStudy.metrics.map((metric) => (
                <CaseStudyHeroMetric
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                />
              ))}
            </div>
            <Link href="/dashboard" className="btn-primary mt-8">
              Try ClipStitchr
            </Link>
          </div>

          <CaseStudyFeatureImage
            src={caseStudy.image}
            alt={`Workspace for the ${caseStudy.companyName} content experiment`}
            caption={`${caseStudy.companyName} used a repeatable short-form workflow to test hooks, publish consistently, and turn attention into customers.`}
          />
        </header>

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <article className="min-w-0 space-y-6">
            <MDXContent code={caseStudy.body} components={mdxComponents} />
          </article>

          <aside className="lg:pt-4">
            <div className="sticky top-8 rounded-lg border border-border bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-text-primary">
                Tools used
              </p>
              <ul className="mt-4 space-y-2 text-sm text-text-secondary">
                {caseStudy.tools.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
              <Link href="/dashboard" className="btn-secondary mt-6 w-full">
                Open Dashboard
              </Link>
            </div>
          </aside>
        </div>

        {caseStudy.faq?.length ? (
          <section className="mt-16 rounded-lg border border-border bg-surface p-8">
            <h2 className="text-2xl font-bold text-text-primary">
              Frequently asked questions
            </h2>
            <div className="mt-8 space-y-6">
              {caseStudy.faq.map((entry) => (
                <div key={entry.question}>
                  <h3 className="text-lg font-bold text-text-primary">
                    {entry.question}
                  </h3>
                  <p className="mt-2 leading-8 text-text-secondary">
                    {entry.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
