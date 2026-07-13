type BlueprintSelectFieldProps = {
  description: string;
  id: string;
  label: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
};

export function BlueprintSelectField({
  description,
  id,
  label,
  onChange,
  options,
  value,
}: BlueprintSelectFieldProps) {
  const descriptionId = `${id}-description`;

  return (
    <label
      className="grid gap-2 text-sm font-semibold text-text-primary"
      htmlFor={id}
    >
      {label}
      <select
        aria-describedby={descriptionId}
        className="h-11 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15"
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
        id={descriptionId}
        className="text-xs font-normal leading-5 text-text-tertiary"
      >
        {description}
      </span>
    </label>
  );
}
