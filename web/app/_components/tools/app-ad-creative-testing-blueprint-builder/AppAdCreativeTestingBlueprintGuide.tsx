const guideItems = [
  {
    title: "Choose the learning question",
    description:
      "The objective and campaign stage decide which three hypothesis lanes deserve attention first.",
  },
  {
    title: "Protect the comparison",
    description:
      "Every cell names one changed variable and the footage, message, demo, or next step that must stay fixed.",
  },
  {
    title: "Decide after fair evidence",
    description:
      "Your own metric, target, spend floor, and event floor shape the decision rubric without pretending to predict a winner.",
  },
];

export function AppAdCreativeTestingBlueprintGuide() {
  return (
    <section className="bg-surface-muted/45 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="marketing-eyebrow">Strategy before scheduling</p>
          <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
            A blueprint explains why each variant exists.
          </h2>
          <p className="mt-5 leading-7 text-text-secondary">
            This tool defines the learning system. Use the related Creative Test
            Plan Generator afterward when you are ready to turn available
            variants into a weekly production order.
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
