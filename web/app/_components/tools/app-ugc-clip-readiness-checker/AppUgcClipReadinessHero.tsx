import { Check, Clapperboard } from "lucide-react";

const benefits = [
  "Local technical check",
  "Role-aware self-review",
  "Copyable handoff report",
];

export function AppUgcClipReadinessHero() {
  return (
    <section className="marketing-grid-bg border-b border-border px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="marketing-eyebrow">
          <Clapperboard aria-hidden className="h-3.5 w-3.5" /> Raw UGC preflight
        </p>
        <h1 className="marketing-heading mt-6 max-w-5xl text-5xl text-text-primary md:text-7xl">
          App UGC Clip Readiness Checker
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-text-secondary">
          Check whether one creator clip is technically playable, clean enough
          to hand off, and flexible enough to reuse—without uploading it.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold text-text-tertiary">
          {benefits.map((benefit) => (
            <span className="inline-flex items-center gap-2" key={benefit}>
              <Check aria-hidden className="h-4 w-4 text-accent" />
              {benefit}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
