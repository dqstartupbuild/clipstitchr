type CaseStudyHeroMetricProps = {
  label: string;
  value: string;
};

export function CaseStudyHeroMetric({
  label,
  value,
}: CaseStudyHeroMetricProps) {
  return (
    <div className="case-study-hero-metric">
      <p>{value}</p>
      <span>{label}</span>
    </div>
  );
}
