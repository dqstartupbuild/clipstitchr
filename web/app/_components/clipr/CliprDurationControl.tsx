import { Clock3 } from "lucide-react";
import { cliprDurationOptions } from "@/lib/clipstitchr/constants/cliprDurationOptions";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";

type CliprDurationControlProps = {
  value: CliprDurationSeconds;
  onChange: (duration: CliprDurationSeconds) => void;
};

export function CliprDurationControl({
  value,
  onChange,
}: CliprDurationControlProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <Clock3 aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Duration</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Length
          </h2>
        </div>
      </div>
      <div className="inline-flex rounded-lg border border-border bg-slate-100 p-1">
        {cliprDurationOptions.map((duration) => (
          <button
            key={duration}
            type="button"
            onClick={() => onChange(duration)}
            className={[
              "h-9 rounded-md px-3 text-sm font-semibold transition-colors",
              value === duration
                ? "bg-white text-accent shadow-sm"
                : "text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            {duration} seconds
          </button>
        ))}
      </div>
    </section>
  );
}
