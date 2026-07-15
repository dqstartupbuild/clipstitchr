import type { CaseStudy } from "content-collections";
import Image from "next/image";
import Link from "next/link";

type CaseStudyIndexCardProps = {
  caseStudy: CaseStudy;
  featured?: boolean;
};

export function CaseStudyIndexCard({
  caseStudy,
  featured = false,
}: CaseStudyIndexCardProps) {
  return (
    <article
      className={`case-study-index-card${featured ? " case-study-index-card-featured" : ""}`}
    >
      <Link href={caseStudy.url} className="case-study-index-image">
        <Image
          src={caseStudy.image}
          alt={`${caseStudy.companyName} campaign evidence`}
          width={1200}
          height={675}
          sizes="(min-width: 900px) 58vw, 100vw"
        />
      </Link>
      <div className="case-study-index-copy">
        <p>
          {caseStudy.companyName} / {caseStudy.category}
        </p>
        <h2>
          <Link href={caseStudy.url}>{caseStudy.title}</Link>
        </h2>
        <p>{caseStudy.excerpt}</p>
        <div className="case-study-index-metrics">
          {caseStudy.metrics.slice(0, 4).map((metric) => (
            <div key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>
        <Link href={caseStudy.url} className="case-study-index-link">
          Read the evidence
        </Link>
      </div>
    </article>
  );
}
