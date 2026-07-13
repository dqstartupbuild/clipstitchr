import type { HookVisualStoryboardBeat } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualStoryboardBeat";

type HookVisualStoryboardProps = {
  beats: HookVisualStoryboardBeat[];
};

export function HookVisualStoryboard({ beats }: HookVisualStoryboardProps) {
  return (
    <ol className="mt-4 grid gap-3">
      {beats.map((beat, index) => (
        <li className="flex gap-3 rounded-lg border border-border bg-surface p-4" key={beat.timeRange}>
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent-dark">
            {index + 1}
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-accent-dark">
              {beat.timeRange}
            </p>
            <h3 className="mt-1 text-sm font-bold text-text-primary">
              {beat.label}
            </h3>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              {beat.instruction}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
