export function HookVisualMatchmakerGuide() {
  return (
    <section className="bg-surface-muted/45 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="marketing-eyebrow">Why the handoff matters</p>
        <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
          The first shot should make the demo feel inevitable.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["Use what exists", "Describe available UGC and product moments instead of planning imaginary proof."],
            ["Keep one question", "The opening and demo should resolve the same tension, not start separate stories."],
            ["Show before asking", "Let viewers see the product moment before the call to action asks for a next step."],
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
