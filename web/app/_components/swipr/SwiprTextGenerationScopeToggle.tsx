import type { SwiprTextGenerationScope } from "@/lib/clipstitchr/types/SwiprTextGenerationScope";

type SwiprTextGenerationScopeToggleProps = {
  value: SwiprTextGenerationScope;
  onChange: (scope: SwiprTextGenerationScope) => void;
};

const options: Array<{
  label: string;
  value: SwiprTextGenerationScope;
}> = [
  { label: "All slides", value: "all" },
  { label: "This slide", value: "selected" },
];

export function SwiprTextGenerationScopeToggle({
  value,
  onChange,
}: SwiprTextGenerationScopeToggleProps) {
  return (
    <div
      className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-slate-100 p-1"
      aria-label="Text generation scope"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          className={[
            "h-8 rounded-md px-3 text-sm font-semibold transition-colors",
            value === option.value
              ? "bg-white text-accent shadow-sm"
              : "text-text-secondary hover:text-text-primary",
          ].join(" ")}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
