import { CaseStudyHeroMetric } from "@/app/_components/case-studies/CaseStudyHeroMetric";

type CaseStudyQuickResultsProps = {
  metrics: ReadonlyArray<{
    label: string;
    value: string;
  }>;
};

export function CaseStudyQuickResults({
  metrics,
}: CaseStudyQuickResultsProps) {
  return (
    <section className="marketing-card p-5 md:p-6">
      <p className="text-sm font-bold text-text-primary">Quick results</p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
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
