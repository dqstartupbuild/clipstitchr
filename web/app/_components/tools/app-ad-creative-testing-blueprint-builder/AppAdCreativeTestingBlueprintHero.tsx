import { Check, Waypoints } from "lucide-react";

const benefits = [
  "Three personalized hypothesis lanes",
  "One-variable control and challenger cells",
  "Evidence rules from your own assumptions",
];

export function AppAdCreativeTestingBlueprintHero() {
  return (
    <section className="marketing-grid-bg border-b border-border px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-4xl">
          <p className="marketing-eyebrow">
            <Waypoints aria-hidden className="h-3.5 w-3.5" />
            Creative learning system
          </p>
          <h1 className="marketing-heading mt-6 text-5xl text-text-primary md:text-7xl">
            App Ad Creative Testing Blueprint Builder
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-text-secondary">
            Turn your testing objective, campaign stage, evidence rules, and
            available source material into a clear learning blueprint. See what
            to change, what must stay fixed, and what your team still needs
            before production.
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
      </div>
    </section>
  );
}
