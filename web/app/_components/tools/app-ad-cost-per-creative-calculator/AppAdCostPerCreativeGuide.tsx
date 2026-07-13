const guideItems = [
  {
    title: "Count usable ideas",
    description:
      "A renamed export is not another creative. Count versions that are genuinely ready to test or publish.",
  },
  {
    title: "Use incremental cost",
    description:
      "For the reuse scenario, enter only the extra cost required to turn the same source assets into more finished versions.",
  },
  {
    title: "Read both totals",
    description:
      "A lower blended unit cost can still come with a higher total spend. The calculator shows both so the tradeoff stays visible.",
  },
];

export function AppAdCostPerCreativeGuide() {
  return (
    <section className="bg-surface-muted/45 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="marketing-eyebrow">Use the comparison honestly</p>
          <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
            A cheaper creative is useful only when it is still worth testing.
          </h2>
          <p className="mt-5 leading-7 text-text-secondary">
            Unit cost helps you plan production. It does not tell you which ad
            will perform or whether more versions are automatically better.
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
