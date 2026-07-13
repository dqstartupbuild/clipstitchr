import { Calculator, Check } from "lucide-react";

const calculatorBenefits = [
  "No footage upload",
  "Nothing leaves your browser",
  "A test plan you can use today",
];

export function AdVariantCalculatorHero() {
  return (
    <section className="marketing-grid-bg border-b border-border px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-4xl">
          <p className="marketing-eyebrow">
            <Calculator aria-hidden className="h-3.5 w-3.5" />
            App marketing calculator
          </p>
          <h1 className="marketing-heading mt-6 text-5xl text-text-primary md:text-7xl">
            Ad Variant Calculator for App Marketing
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-text-secondary">
            See how many ads are hiding in the UGC clips, product demos, hooks,
            and calls to action you already have. Then turn the giant number
            into a first batch you can actually learn from.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold text-text-tertiary">
            {calculatorBenefits.map((benefit) => (
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
