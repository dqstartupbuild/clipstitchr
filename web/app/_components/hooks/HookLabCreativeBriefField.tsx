export function HookLabCreativeBriefField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-text-primary">
      {label}
      <textarea
        className="min-h-24 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm font-normal leading-6 text-text-primary outline-none transition-colors focus:border-accent"
        maxLength={4_000}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  );
}
