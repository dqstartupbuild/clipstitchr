type AppAdTestPlanMetricCardProps = {
  description: string;
  label: string;
  value: number;
};

export function AppAdTestPlanMetricCard({
  description,
  label,
  value,
}: AppAdTestPlanMetricCardProps) {
  return (
    <article className="rounded-lg border border-border bg-surface-muted/45 p-4">
      <p className="text-xs font-bold uppercase text-text-tertiary">{label}</p>
      <p className="mt-2 text-3xl font-bold text-text-primary">
        {value.toLocaleString("en-US")}
      </p>
      <p className="mt-2 text-xs leading-5 text-text-secondary">
        {description}
      </p>
    </article>
  );
}
