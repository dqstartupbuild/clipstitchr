export function AppAdHookRewriterGuide() {
  return (
    <section className="bg-surface-muted/45 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="marketing-eyebrow">A better way to rewrite</p>
        <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
          Change the angle, not just the adjectives.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["Start real", "Use a real audience, problem, and result instead of vague hype."],
            ["Pick for footage", "A problem hook and an outcome hook need different opening shots."],
            ["Keep proof visible", "Do not add numbers, guarantees, or borrowed authority the demo cannot support."],
          ].map(([title, description]) => (
            <article className="marketing-card p-6" key={title}>
              <h3 className="text-lg font-bold text-text-primary">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
