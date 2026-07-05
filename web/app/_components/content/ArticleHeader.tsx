type ArticleHeaderProps = {
  category: string;
  title: string;
  description: string;
  author: string;
  date: string;
  readingTimeMinutes: number;
  tags: string[];
};

export function ArticleHeader({
  category,
  title,
  description,
  author,
  date,
  readingTimeMinutes,
  tags,
}: ArticleHeaderProps) {
  return (
    <header className="mt-8">
      <p className="marketing-eyebrow">{category}</p>
      <h1 className="marketing-heading mt-6 text-5xl text-text-primary md:text-7xl">
        {title}
      </h1>
      <p className="mt-6 text-lg leading-8 text-text-secondary">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap gap-4 text-sm text-text-tertiary">
        <span>{author}</span>
        <span>.</span>
        <span>{date}</span>
        <span>.</span>
        <span>{readingTimeMinutes} min read</span>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-border bg-surface px-3 py-1 text-xs text-text-tertiary"
          >
            {tag}
          </span>
        ))}
      </div>
    </header>
  );
}
