const guideItems = [
  {
    description:
      "Name the exact person and frustrating moment. Generic input produces a generic opening.",
    title: "Start with recognition",
  },
  {
    description:
      "Choose a line that the first seconds of your product demo can answer or prove visually.",
    title: "Match the hook to the demo",
  },
  {
    description:
      "Test different openings around the same demo before changing every piece of the ad at once.",
    title: "Change one thing first",
  },
];

export function AppHookGeneratorGuide() {
  return (
    <section className="bg-surface-muted/45 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="marketing-eyebrow">How to use the hooks</p>
          <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
            The best hook makes the next shot feel necessary.
          </h2>
          <p className="mt-5 leading-7 text-text-secondary">
            A clever sentence is not enough. The opening should call out the
            right person, create a small gap, and let your app demo close it.
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
