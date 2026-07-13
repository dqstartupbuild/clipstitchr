const guideItems = [
  {
    title: "Ask for modules",
    description:
      "Separate hooks, reactions, b-roll moments, and calls to action stay easier to test and reuse than one edited montage.",
  },
  {
    title: "Keep proof honest",
    description:
      "Give the creator only proof you can support. If there is no approved proof, the brief makes that boundary explicit.",
  },
  {
    title: "Plan the demo handoff",
    description:
      "The UGC opening creates recognition. A separate app demo should show the key product moment that answers it.",
  },
];

export function AppUgcBriefBuilderGuide() {
  return (
    <section className="bg-surface-muted/45 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="marketing-eyebrow">A more reusable handoff</p>
          <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
            Brief the footage, not one finished edit.
          </h2>
          <p className="mt-5 leading-7 text-text-secondary">
            The best creator handoff makes each source clip clear on its own.
            That gives you more honest ways to combine, learn, and produce.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {guideItems.map((item, index) => (
            <article className="marketing-card p-6" key={item.title}>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent-dark">
                {index + 1}
              </span>
              <h3 className="marketing-subheading mt-4 text-2xl text-text-primary">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
