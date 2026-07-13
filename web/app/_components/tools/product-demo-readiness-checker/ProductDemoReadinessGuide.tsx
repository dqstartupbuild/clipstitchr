export function ProductDemoReadinessGuide() {
  return (
    <section className="bg-surface-muted/45 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="marketing-eyebrow">What a useful demo does</p>
        <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
          Make the product moment easy to follow.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <article className="marketing-card p-6">
            <p className="text-sm font-bold text-accent-dark">Open</p>
            <h3 className="mt-3 text-xl font-bold text-text-primary">
              Show something useful fast
            </h3>
            <p className="mt-3 leading-7 text-text-secondary">
              Skip the long login, loading, and setup sequence. Start close to
              the product action the viewer came to understand.
            </p>
          </article>
          <article className="marketing-card p-6">
            <p className="text-sm font-bold text-accent-dark">Prove</p>
            <h3 className="mt-3 text-xl font-bold text-text-primary">
              Keep the action and result together
            </h3>
            <p className="mt-3 leading-7 text-text-secondary">
              A tap without a result feels unfinished. A result without the
              action can feel unearned. Let the viewer see both.
            </p>
          </article>
          <article className="marketing-card p-6">
            <p className="text-sm font-bold text-accent-dark">Close</p>
            <h3 className="mt-3 text-xl font-bold text-text-primary">
              Give one next step
            </h3>
            <p className="mt-3 leading-7 text-text-secondary">
              The product moment should lead naturally to one action. Remove
              extra asks that compete with the main idea.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
