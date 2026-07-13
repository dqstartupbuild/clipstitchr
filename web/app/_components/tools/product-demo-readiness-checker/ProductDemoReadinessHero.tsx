import { Check, ListChecks } from "lucide-react";

const benefits = [
  "Technical and story checks together",
  "Nothing leaves your browser",
  "Three prioritized next fixes",
];

export function ProductDemoReadinessHero() {
  return (
    <section className="marketing-grid-bg border-b border-border px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-4xl">
          <p className="marketing-eyebrow">
            <ListChecks aria-hidden className="h-3.5 w-3.5" />
            App demo checklist
          </p>
          <h1 className="marketing-heading mt-6 text-5xl text-text-primary md:text-7xl">
            Product Demo Readiness Checker
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-text-secondary">
            Find out whether your app demo is clear, safe, readable, and tight
            enough for its first creative test. The file check and your answers
            stay on this device.
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
