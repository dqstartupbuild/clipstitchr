type ResourceGuideProps = {
  paragraphs: readonly string[];
  title: string;
};

export function ResourceGuide({ paragraphs, title }: ResourceGuideProps) {
  return (
    <section className="bg-surface-muted/45 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="marketing-eyebrow">How to use it</p>
        <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-5xl">
          {title}
        </h2>
        <div className="mt-6 grid gap-4 text-base leading-8 text-text-secondary">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
