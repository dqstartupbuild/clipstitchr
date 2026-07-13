type AppUgcBriefSelectFieldProps = {
  description: string;
  id: string;
  label: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
};

export function AppUgcBriefSelectField({
  description,
  id,
  label,
  options,
  value,
  onChange,
}: AppUgcBriefSelectFieldProps) {
  const descriptionId = `${id}-description`;

  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold text-text-primary">{label}</span>
      <select
        aria-describedby={descriptionId}
        className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15"
        id={id}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span
        className="mt-2 block text-xs leading-5 text-text-tertiary"
        id={descriptionId}
      >
        {description}
      </span>
    </label>
  );
}
