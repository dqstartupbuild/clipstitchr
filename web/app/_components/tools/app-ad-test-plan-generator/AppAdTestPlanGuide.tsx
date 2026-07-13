const guideItems = [
  {
    title: "Openings first",
    description:
      "Compare UGC openings while the product demo, hook direction, and call to action stay fixed.",
  },
  {
    title: "Hooks second",
    description:
      "Keep the strongest footage pairing and test the words that frame the product moment.",
  },
  {
    title: "Rotate one piece",
    description:
      "Try demos, then calls to action, without changing both in the same comparison.",
  },
];

export function AppAdTestPlanGuide() {
  return (
    <section className="bg-surface-muted/45 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="marketing-eyebrow">A test you can explain</p>
          <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
            Every wave should answer one useful question.
          </h2>
          <p className="mt-5 leading-7 text-text-secondary">
            A giant combination count shows the opportunity. A staged plan
            helps your team learn why one version deserves the next round.
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
