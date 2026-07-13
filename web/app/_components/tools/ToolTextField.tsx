type ToolTextFieldProps = {
  description?: string;
  id: string;
  label: string;
  maxLength: number;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
};

export function ToolTextField({
  description,
  id,
  label,
  maxLength,
  onChange,
  placeholder,
  required = true,
  value,
}: ToolTextFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <label className="grid gap-2 text-sm font-semibold text-text-primary" htmlFor={id}>
      {label}
      <input
        aria-describedby={descriptionId}
        className="h-11 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent focus:ring-2 focus:ring-accent/15"
        id={id}
        maxLength={maxLength}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
      {description ? (
        <span id={descriptionId} className="text-xs font-normal leading-5 text-text-tertiary">
          {description}
        </span>
      ) : null}
    </label>
  );
}
