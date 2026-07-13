import { Check, ScanLine } from "lucide-react";

const benefits = [
  "Nothing leaves your browser",
  "No video conversion or upload",
  "Clear fixes for every warning",
];

export function NineBySixteenVideoCheckerHero() {
  return (
    <section className="marketing-grid-bg border-b border-border px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-4xl">
          <p className="marketing-eyebrow">
            <ScanLine aria-hidden className="h-3.5 w-3.5" />
            Private app demo check
          </p>
          <h1 className="marketing-heading mt-6 text-5xl text-text-primary md:text-7xl">
            9:16 App Demo Video Checker
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-text-secondary">
            Check whether an app demo has the shape, size, playback support,
            and media settings you want before it becomes the product moment
            inside a vertical ad.
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
