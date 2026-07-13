import { RefreshCw } from "lucide-react";

export function AppAdHookRewriterHero() {
  return (
    <section className="marketing-grid-bg px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="marketing-eyebrow">Free app-ad hook rewriter</p>
        <h1 className="marketing-heading mt-6 max-w-4xl text-5xl text-text-primary md:text-7xl">
          Turn one app hook into six angles worth testing.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-text-secondary">
          Get clearer, shorter, audience-first, problem-first, outcome-led, and
          pattern-break versions without made-up proof or provider calls.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-bold text-accent-dark">
          <RefreshCw aria-hidden className="h-4 w-4" />
          Six deterministic rewrites in your browser
        </div>
      </div>
    </section>
  );
}
