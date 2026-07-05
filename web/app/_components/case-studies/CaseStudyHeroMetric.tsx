type CaseStudyHeroMetricProps = {
  label: string;
  value: string;
};

export function CaseStudyHeroMetric({
  label,
  value,
}: CaseStudyHeroMetricProps) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted p-4">
      <p className="marketing-subheading text-3xl text-text-primary">{value}</p>
      <p className="mt-1 text-sm text-text-tertiary">{label}</p>
    </div>
  );
}
