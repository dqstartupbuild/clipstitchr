import { Check, Sparkles } from "lucide-react";

const benefits = [
  "Eight hooks per set",
  "Built for app demos",
  "No invented stats or testimonials",
];

export function AppHookGeneratorHero() {
  return (
    <section className="marketing-grid-bg border-b border-border px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-4xl">
          <p className="marketing-eyebrow">
            <Sparkles aria-hidden className="h-3.5 w-3.5" />
            App marketing hook tool
          </p>
          <h1 className="marketing-heading mt-6 text-5xl text-text-primary md:text-7xl">
            App Hook Generator for Short-Form Ads
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-text-secondary">
            Turn your app, audience, problem, and desired outcome into short
            opening lines you can use before a product demo. Pick safe, punchy,
            or bold depending on how hard you want the ad to interrupt the
            scroll.
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
