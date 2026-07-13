type AppHookGeneratorTextAreaProps = {
  description: string;
  id: string;
  label: string;
  maxLength: number;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function AppHookGeneratorTextArea({
  description,
  id,
  label,
  maxLength,
  placeholder,
  value,
  onChange,
}: AppHookGeneratorTextAreaProps) {
  const descriptionId = `${id}-description`;

  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold text-text-primary">{label}</span>
      <textarea
        id={id}
        aria-describedby={descriptionId}
        className="mt-2 min-h-24 w-full resize-y rounded-lg border border-border bg-surface px-3 py-3 text-sm leading-6 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent focus:ring-2 focus:ring-accent/15"
        maxLength={maxLength}
        minLength={2}
        placeholder={placeholder}
        required
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
      <span
        id={descriptionId}
        className="mt-2 block text-xs leading-5 text-text-tertiary"
      >
        {description}
      </span>
    </label>
  );
}
