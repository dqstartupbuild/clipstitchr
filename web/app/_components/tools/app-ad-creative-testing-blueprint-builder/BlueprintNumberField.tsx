type BlueprintNumberFieldProps = {
  description: string;
  id: string;
  label: string;
  max: number;
  min?: number;
  optional?: boolean;
  step?: number;
  value: number | null;
  onChange: (value: number | null) => void;
};

export function BlueprintNumberField({
  description,
  id,
  label,
  max,
  min = 0,
  onChange,
  optional = false,
  step = 1,
  value,
}: BlueprintNumberFieldProps) {
  const descriptionId = `${id}-description`;

  return (
    <label
      className="grid gap-2 text-sm font-semibold text-text-primary"
      htmlFor={id}
    >
      {label}
      <input
        aria-describedby={descriptionId}
        className="h-11 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15"
        id={id}
        inputMode="decimal"
        max={max}
        min={min}
        required={!optional}
        step={step}
        type="number"
        value={value ?? ""}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          onChange(nextValue === "" ? null : Number(nextValue));
        }}
      />
      <span
        id={descriptionId}
        className="text-xs font-normal leading-5 text-text-tertiary"
      >
        {description}
      </span>
    </label>
  );
}
