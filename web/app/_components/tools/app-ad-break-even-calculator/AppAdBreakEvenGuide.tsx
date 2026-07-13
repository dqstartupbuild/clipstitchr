const guideItems = [
  {
    title: "Keep the revenue window consistent",
    description:
      "If customer revenue covers 90 days, judge the result against the same 90-day customer cohort rather than lifetime revenue.",
  },
  {
    title: "Use contribution, not headline revenue",
    description:
      "Account for the variable costs you care about so the customer value is not larger than the value your app actually keeps.",
  },
  {
    title: "Include creative in the investment",
    description:
      "Ad dashboards show media spend clearly. Adding production cost keeps the campaign target from looking cheaper than it really is.",
  },
];

export function AppAdBreakEvenGuide() {
  return (
    <section className="bg-surface-muted/45 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="marketing-eyebrow">Use one honest scenario</p>
          <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
            Break-even math is only as useful as the assumptions underneath it.
          </h2>
          <p className="mt-5 leading-7 text-text-secondary">
            This calculator makes the arithmetic visible. It does not decide
            what your conversion rate, customer value, or budget should be.
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
