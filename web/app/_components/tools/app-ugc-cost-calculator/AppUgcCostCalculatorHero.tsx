import { Calculator, Check } from "lucide-react";

const benefits = [
  "Use your own USD costs",
  "See cost per finished variant",
  "No creator-rate guesswork",
];

export function AppUgcCostCalculatorHero() {
  return (
    <section className="marketing-grid-bg border-b border-border px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-4xl">
          <p className="marketing-eyebrow">
            <Calculator aria-hidden className="h-3.5 w-3.5" />
            App UGC production economics
          </p>
          <h1 className="marketing-heading mt-6 text-5xl text-text-primary md:text-7xl">
            App UGC Production Cost Calculator
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-text-secondary">
            Add the creator, editing, revision, and internal costs from one
            production cycle. See the batch total, cost per creative, and how
            much creator spend may still be sitting in unused footage.
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
