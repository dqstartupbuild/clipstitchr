type AppUgcBriefTextFieldProps = {
  description: string;
  id: string;
  label: string;
  maxLength: number;
  multiline?: boolean;
  placeholder: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
};

export function AppUgcBriefTextField({
  description,
  id,
  label,
  maxLength,
  multiline = false,
  placeholder,
  required = true,
  value,
  onChange,
}: AppUgcBriefTextFieldProps) {
  const descriptionId = `${id}-description`;
  const className =
    "mt-2 w-full rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent focus:ring-2 focus:ring-accent/15";
  const sharedProps = {
    "aria-describedby": descriptionId,
    id,
    maxLength,
    placeholder,
    required,
    value,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => onChange(event.currentTarget.value),
  };

  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold text-text-primary">{label}</span>
      {multiline ? (
        <textarea {...sharedProps} className={`${className} py-2`} rows={3} />
      ) : (
        <input {...sharedProps} className={`${className} h-11`} />
      )}
      <span
        id={descriptionId}
        className="mt-2 block text-xs leading-5 text-text-tertiary"
      >
        {description}
      </span>
    </label>
  );
}
