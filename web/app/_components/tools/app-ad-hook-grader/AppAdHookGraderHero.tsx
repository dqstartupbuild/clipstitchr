import { ShieldCheck } from "lucide-react";

export function AppAdHookGraderHero() {
  return (
    <section className="marketing-grid-bg px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="marketing-eyebrow">Free app-ad hook grader</p>
        <h1 className="marketing-heading mt-6 max-w-4xl text-5xl text-text-primary md:text-7xl">
          See what your hook communicates before you film it.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-text-secondary">
          Check one opening for clarity, specificity, audience fit, curiosity,
          visual flow, and claims that may need stronger proof.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-bold text-accent-dark">
          <ShieldCheck aria-hidden className="h-4 w-4" />
          Your hook stays in this browser
        </div>
      </div>
    </section>
  );
}
