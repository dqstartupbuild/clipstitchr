type ShortFormVideoSpecFieldProps = {
  label: string;
  value: string;
};

export function ShortFormVideoSpecField({
  label,
  value,
}: ShortFormVideoSpecFieldProps) {
  return (
    <div className="rounded-lg bg-surface-muted p-3">
      <dt className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold leading-6 text-text-primary">
        {value}
      </dd>
    </div>
  );
}
