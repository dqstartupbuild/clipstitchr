type LandingProofMetricProps = {
  label: string;
  value: string;
};

export function LandingProofMetric({ label, value }: LandingProofMetricProps) {
  return (
    <div className="landing-proof-metric">
      <p>{value}</p>
      <span>{label}</span>
    </div>
  );
}
