import { PanelsTopLeft } from "lucide-react";

export function HookVisualMatchmakerHero() {
  return (
    <section className="marketing-grid-bg px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="marketing-eyebrow">Free hook-to-visual matchmaker</p>
        <h1 className="marketing-heading mt-6 max-w-4xl text-5xl text-text-primary md:text-7xl">
          Give your app hook a first shot that earns it.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-text-secondary">
          Turn one hook and the footage you actually have into a practical
          0–5 second opening, demo handoff, and alternate plan.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-bold text-accent-dark">
          <PanelsTopLeft aria-hidden className="h-4 w-4" />
          No uploads and no made-up shots
        </div>
      </div>
    </section>
  );
}
