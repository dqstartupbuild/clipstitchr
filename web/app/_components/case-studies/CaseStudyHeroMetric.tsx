type CaseStudyHeroMetricProps = {
  label: string;
  value: string;
};

export function CaseStudyHeroMetric({
  label,
  value,
}: CaseStudyHeroMetricProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="mt-1 text-sm text-text-tertiary">{label}</p>
    </div>
  );
}
