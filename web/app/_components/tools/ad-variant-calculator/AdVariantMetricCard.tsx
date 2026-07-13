type AdVariantMetricCardProps = {
  description: string;
  label: string;
  value: number;
};

export function AdVariantMetricCard({
  description,
  label,
  value,
}: AdVariantMetricCardProps) {
  return (
    <article className="rounded-lg border border-border bg-surface-muted p-4">
      <p className="marketing-subheading text-4xl text-text-primary">
        {value.toLocaleString("en-US")}
      </p>
      <h3 className="mt-2 text-sm font-bold text-text-primary">{label}</h3>
      <p className="mt-1 text-xs leading-5 text-text-tertiary">
        {description}
      </p>
    </article>
  );
}
