import type { HookVisualPreferredOpening } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualPreferredOpening";

type HookVisualPreferredOpeningFieldProps = {
  value: HookVisualPreferredOpening;
  onChange: (value: HookVisualPreferredOpening) => void;
};

const options: {
  description: string;
  label: string;
  value: HookVisualPreferredOpening;
}[] = [
  {
    description: "Let the hook intent and available footage decide.",
    label: "Choose for me",
    value: "choose",
  },
  {
    description: "Start on a creator, founder, reaction, or real-life moment.",
    label: "UGC",
    value: "ugc",
  },
  {
    description: "Start directly on the available app or product moment.",
    label: "Demo",
    value: "demo",
  },
];

export function HookVisualPreferredOpeningField({
  onChange,
  value,
}: HookVisualPreferredOpeningFieldProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-text-primary">
        Preferred opening source
      </legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <label
            className={[
              "cursor-pointer rounded-lg border p-3 transition-colors",
              value === option.value
                ? "border-accent bg-accent/10"
                : "border-border bg-surface hover:border-accent/60",
            ].join(" ")}
            key={option.value}
          >
            <input
              checked={value === option.value}
              className="sr-only"
              name="hook-visual-opening-source"
              type="radio"
              value={option.value}
              onChange={() => onChange(option.value)}
            />
            <span className="block text-sm font-bold text-text-primary">
              {option.label}
            </span>
            <span className="mt-1 block text-xs leading-5 text-text-tertiary">
              {option.description}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
