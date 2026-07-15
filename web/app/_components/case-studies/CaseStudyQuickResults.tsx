import { CaseStudyHeroMetric } from "@/app/_components/case-studies/CaseStudyHeroMetric";

type CaseStudyQuickResultsProps = {
  metrics: ReadonlyArray<{
    label: string;
    value: string;
  }>;
};

export function CaseStudyQuickResults({ metrics }: CaseStudyQuickResultsProps) {
  return (
    <section className="case-study-quick-results">
      <p>Quick results</p>
      <div>
        {metrics.map((metric) => (
          <CaseStudyHeroMetric
            key={metric.label}
            label={metric.label}
            value={metric.value}
          />
        ))}
      </div>
    </section>
  );
}
