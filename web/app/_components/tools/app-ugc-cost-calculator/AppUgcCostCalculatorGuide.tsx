const guideItems = [
  {
    title: "Count every production input",
    description:
      "Creator fees are only one line. Editing, revisions, and internal coordination can change the real subtotal quickly.",
  },
  {
    title: "Separate value from added cost",
    description:
      "Unused-footage value is part of creator spend, so the calculator highlights it without adding it to the total twice.",
  },
  {
    title: "Look at the reusable library",
    description:
      "Paid source footage that has not reached a finished variant may still support another hook, demo, or testing batch.",
  },
];

export function AppUgcCostCalculatorGuide() {
  return (
    <section className="bg-surface-muted/45 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="marketing-eyebrow">See the full production cycle</p>
          <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
            The cheapest clip is not always the cheapest creative.
          </h2>
          <p className="mt-5 leading-7 text-text-secondary">
            A useful estimate connects the footage you paid for to the finished
            variants your team actually produced.
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
