import { Check, ListVideo } from "lucide-react";

const benefits = [
  "One card per source file",
  "Clean demo handoff",
  "Copyable shoot-day list",
];

export function AppAdShotListHero() {
  return (
    <section className="marketing-grid-bg border-b border-border px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="marketing-eyebrow">
          <ListVideo aria-hidden className="h-3.5 w-3.5" /> App-ad filming plan
        </p>
        <h1 className="marketing-heading mt-6 max-w-5xl text-5xl text-text-primary md:text-7xl">
          App Ad Shot List Generator
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-text-secondary">
          Turn one app-ad idea into individually numbered UGC, b-roll,
          product-demo, proof, and call-to-action files your shoot can actually
          capture.
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
