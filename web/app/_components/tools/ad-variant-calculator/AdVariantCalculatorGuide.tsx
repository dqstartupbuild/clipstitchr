const guideItems = [
  {
    title: "UGC + demo pairings",
    formula: "UGC clips x product demos",
    description:
      "This is the number of different footage sequences you can make before changing any words.",
  },
  {
    title: "Possible test combinations",
    formula: "Pairings x hooks x calls to action",
    description:
      "This shows the full idea space. It is useful for planning, but making every version at once usually creates noise instead of answers.",
  },
  {
    title: "Practical first batch",
    formula: "Up to 20 UGC clips + 1 demo",
    description:
      "This mirrors a focused Stitchr batch: one selected demo, one shared text direction, and one finished Stitch per UGC clip.",
  },
];

export function AdVariantCalculatorGuide() {
  return (
    <section className="bg-surface-muted/45 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="marketing-eyebrow">How the math works</p>
          <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
            More combinations do not mean more clarity.
          </h2>
          <p className="mt-5 text-base leading-7 text-text-secondary">
            The calculator separates everything you could make from the batch
            you should test first. That keeps a large footage library useful
            without turning your next campaign into a guessing game.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {guideItems.map((item) => (
            <article className="marketing-card p-6" key={item.title}>
              <p className="text-xs font-bold uppercase text-accent-dark">
                {item.formula}
              </p>
              <h3 className="marketing-subheading mt-3 text-2xl text-text-primary">
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
