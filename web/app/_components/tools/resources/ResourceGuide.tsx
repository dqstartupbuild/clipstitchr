type ResourceGuideProps = {
  paragraphs: readonly string[];
  title: string;
};

export function ResourceGuide({ paragraphs, title }: ResourceGuideProps) {
  return (
    <section className="public-tool-guide">
      <div>
        <p>How to use it</p>
        <h2 className="marketing-heading">{title}</h2>
        <div>
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
