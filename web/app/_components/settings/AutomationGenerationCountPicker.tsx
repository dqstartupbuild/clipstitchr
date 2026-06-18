import { automationGenerationCountOptions } from "@/lib/clipstitchr/constants/automationGenerationCountOptions";
import type { AutomationGenerationCount } from "@/lib/clipstitchr/types/AutomationGenerationCount";

type AutomationGenerationCountPickerProps = {
  disabled: boolean;
  label: string;
  value: AutomationGenerationCount;
  onChange: (value: AutomationGenerationCount) => void;
};

export function AutomationGenerationCountPicker({
  disabled,
  label,
  value,
  onChange,
}: AutomationGenerationCountPickerProps) {
  return (
    <div className="grid gap-2">
      <p className="text-sm font-semibold text-text-primary">{label}</p>
      <div className="flex min-w-0 flex-wrap gap-2">
        {automationGenerationCountOptions.map((count) => (
          <button
            key={count}
            type="button"
            aria-pressed={value === count}
            className={[
              "inline-flex h-9 min-w-12 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              value === count
                ? "border-accent bg-surface-muted text-accent-dark"
                : "border-border bg-white text-text-secondary hover:border-accent",
            ].join(" ")}
            disabled={disabled}
            onClick={() => onChange(count)}
          >
            {count}
          </button>
        ))}
      </div>
    </div>
  );
}
