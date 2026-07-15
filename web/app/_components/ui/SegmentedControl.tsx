"use client";

export type SegmentedControlOption<Value extends string> = {
  count?: number;
  disabled?: boolean;
  label: string;
  value: Value;
};

type SegmentedControlProps<Value extends string> = {
  ariaLabel: string;
  className?: string;
  options: SegmentedControlOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
};

export function SegmentedControl<Value extends string>({
  ariaLabel,
  className = "",
  options,
  value,
  onChange,
}: SegmentedControlProps<Value>) {
  return (
    <div
      aria-label={ariaLabel}
      className={[
        "segmented-control inline-flex flex-wrap gap-1 rounded-lg border border-border bg-surface-muted p-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="group"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          disabled={option.disabled}
          onClick={() => onChange(option.value)}
          className={[
            "segmented-control-option h-8 rounded-md px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            value === option.value
              ? "bg-surface text-accent-dark shadow-sm"
              : "text-text-secondary hover:text-text-primary",
          ].join(" ")}
        >
          {option.label}
          {typeof option.count === "number" ? (
            <span className="ml-1 text-xs text-text-tertiary">
              {option.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
