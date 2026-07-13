type ToolMetricCardProps = {
  description: string;
  label: string;
  value: string;
};

export function ToolMetricCard({
  description,
  label,
  value,
}: ToolMetricCardProps) {
  return (
    <article className="rounded-lg border border-border bg-surface-muted/45 p-4">
      <p className="text-xs font-bold uppercase text-text-tertiary">{label}</p>
      <p className="mt-2 text-2xl font-bold text-text-primary">{value}</p>
      <p className="mt-2 text-xs leading-5 text-text-secondary">
        {description}
      </p>
    </article>
  );
}
