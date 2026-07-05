import { CaseStudyIndexCard } from "@/app/_components/case-studies/CaseStudyIndexCard";
import {
  getCaseStudyCategories,
  getFeaturedCaseStudies,
  getPublishedCaseStudies,
} from "@/lib/content/caseStudyQueries";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `Case Studies | ${site.name}`,
  description:
    "Real ClipStitchr case studies from app builders using short-form ads without pretending content is the fun part.",
  canonical: "/case-studies",
});

export default function CaseStudiesIndexPage() {
  const caseStudies = getPublishedCaseStudies();
  const featured = getFeaturedCaseStudies()[0] ?? caseStudies[0];
  const categories = getCaseStudyCategories();

  return (
    <div className="marketing-grid-bg px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="marketing-eyebrow">
            Case studies
          </p>
          <h1 className="marketing-heading mt-6 text-5xl text-text-primary md:text-7xl">
            Proof from people who would rather build than edit content.
          </h1>
          <p className="mt-6 text-lg leading-8 text-text-secondary">
            Real examples from apps using short-form without making content the
            whole job.
          </p>
          {categories.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-text-tertiary">
              {categories.map((category) => (
                <span
                  key={category}
                  className="rounded-md border border-border bg-surface px-3 py-1.5"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>

        {featured ? (
          <section className="mt-14">
            <p className="text-sm font-semibold text-accent-dark">
              Featured case study
            </p>
            <CaseStudyIndexCard caseStudy={featured} />
          </section>
        ) : null}

        <section className="mt-14 grid gap-6 md:grid-cols-2">
          {caseStudies.map((caseStudy) => (
            <CaseStudyIndexCard caseStudy={caseStudy} key={caseStudy.slug} />
          ))}
        </section>
      </div>
    </div>
  );
}
