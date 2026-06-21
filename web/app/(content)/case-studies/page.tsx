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
    "Real ClipStitchr case studies showing how founders and teams turn UGC footage into short-form content that drives attention and customers.",
  canonical: "/case-studies",
});

export default function CaseStudiesIndexPage() {
  const caseStudies = getPublishedCaseStudies();
  const featured = getFeaturedCaseStudies()[0] ?? caseStudies[0];
  const categories = getCaseStudyCategories();

  return (
    <div className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-accent-dark">
            Case studies
          </p>
          <h1 className="mt-4 text-4xl font-bold text-text-primary md:text-5xl">
            See how teams turn UGC into growth.
          </h1>
          <p className="mt-6 text-lg leading-8 text-text-secondary">
            Real examples of the content systems, workflows, and results behind
            ClipStitchr campaigns.
          </p>
          {categories.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-text-tertiary">
              {categories.map((category) => (
                <span
                  key={category}
                  className="rounded-md border border-border bg-white px-3 py-1.5"
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
