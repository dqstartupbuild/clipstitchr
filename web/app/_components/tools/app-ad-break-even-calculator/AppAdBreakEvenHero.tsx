import { CircleDollarSign, Check } from "lucide-react";

const benefits = [
  "Include media and creative cost",
  "Use your own customer economics",
  "See every formula and assumption",
];

export function AppAdBreakEvenHero() {
  return (
    <section className="marketing-grid-bg border-b border-border px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-4xl">
          <p className="marketing-eyebrow">
            <CircleDollarSign aria-hidden className="h-3.5 w-3.5" />
            App-ad break-even planning
          </p>
          <h1 className="marketing-heading mt-6 text-5xl text-text-primary md:text-7xl">
            App Ad Break-Even Calculator
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-text-secondary">
            Find the paying customers, installs, customer revenue, and blended
            acquisition cost your entered app-ad scenario needs to break even.
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
