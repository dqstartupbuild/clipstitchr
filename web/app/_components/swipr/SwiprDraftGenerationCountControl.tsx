"use client";

type SwiprDraftGenerationCountControlProps = {
  disabled?: boolean;
  value: number;
  onChange: (count: number) => void;
};

const countOptions = [1, 3, 5, 10];

export function SwiprDraftGenerationCountControl({
  disabled = false,
  value,
  onChange,
}: SwiprDraftGenerationCountControlProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {countOptions.map((count) => (
        <button
          key={count}
          type="button"
          className={[
            "h-9 min-w-10 rounded-lg border px-3 text-sm font-semibold transition-colors",
            value === count
              ? "border-accent bg-accent text-white"
              : "border-border bg-white text-text-secondary hover:border-accent",
          ].join(" ")}
          disabled={disabled}
          onClick={() => onChange(count)}
        >
          {count}
        </button>
      ))}
      <input
        type="number"
        min={1}
        max={10}
        value={value}
        className="h-9 w-20 rounded-lg border border-border bg-surface px-3 text-center text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
        disabled={disabled}
        onChange={(event) =>
          onChange(Math.max(1, Math.min(10, Number(event.target.value) || 1)))
        }
      />
    </div>
  );
}
