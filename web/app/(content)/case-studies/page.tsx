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
    <div className="case-studies-index-page">
      <div className="case-studies-index-inner">
        <header className="case-studies-index-hero">
          <p>Case studies / campaign evidence, not testimonials</p>
          <h1 className="marketing-heading">Real work. Real numbers.</h1>
          <div>
            <p>
              Real examples from apps using short-form without making content
              the whole job.
            </p>
            {categories.length > 0 && (
              <div className="case-studies-categories">
                {categories.map((category, index) => (
                  <span key={category}>
                    {index > 0 ? " / " : ""}
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {featured ? (
          <section className="case-studies-featured">
            <p>Lead evidence</p>
            <CaseStudyIndexCard caseStudy={featured} featured />
          </section>
        ) : null}

        <section className="case-studies-list">
          {caseStudies.map((caseStudy) => (
            <CaseStudyIndexCard caseStudy={caseStudy} key={caseStudy.slug} />
          ))}
        </section>
      </div>
    </div>
  );
}
