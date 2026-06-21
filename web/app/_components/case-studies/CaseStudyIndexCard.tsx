import type { CaseStudy } from "content-collections";
import Link from "next/link";

type CaseStudyIndexCardProps = {
  caseStudy: CaseStudy;
};

export function CaseStudyIndexCard({ caseStudy }: CaseStudyIndexCardProps) {
  return (
    <article className="rounded-lg border border-border bg-surface p-7 shadow-sm transition-colors hover:border-accent">
      <p className="text-sm text-text-tertiary">
        {caseStudy.companyName} . {caseStudy.category}
      </p>
      <h2 className="mt-3 text-2xl font-bold text-text-primary">
        <Link href={caseStudy.url} className="hover:text-accent">
          {caseStudy.title}
        </Link>
      </h2>
      <p className="mt-4 text-base leading-8 text-text-secondary">
        {caseStudy.excerpt}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {caseStudy.metrics.slice(0, 4).map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-border bg-white p-3"
          >
            <p className="text-lg font-bold text-text-primary">
              {metric.value}
            </p>
            <p className="mt-1 text-xs text-text-tertiary">{metric.label}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
