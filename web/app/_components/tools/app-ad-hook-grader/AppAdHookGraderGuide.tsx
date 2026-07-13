export function AppAdHookGraderGuide() {
  return (
    <section className="bg-surface-muted/45 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="marketing-eyebrow">How to use the grade</p>
        <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
          Fix the weakest link, then test the ad.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["1", "Read the lowest score", "That is the clearest place to improve before changing everything else."],
            ["2", "Keep claims grounded", "Use only facts, outcomes, and proof the product and footage can support."],
            ["3", "Test the finished pairing", "A good line still needs the right opening shot and demo handoff."],
          ].map(([number, title, description]) => (
            <article className="marketing-card p-6" key={number}>
              <p className="text-sm font-bold text-accent-dark">Step {number}</p>
              <h3 className="mt-3 text-lg font-bold text-text-primary">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
