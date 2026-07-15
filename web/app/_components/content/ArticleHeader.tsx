type ArticleHeaderProps = {
  category: string;
  title: string;
  displayTitle?: string;
  description: string;
  author: string;
  date: string;
  readingTimeMinutes: number;
  tags: string[];
};

export function ArticleHeader({
  category,
  title,
  displayTitle,
  description,
  author,
  date,
  readingTimeMinutes,
  tags,
}: ArticleHeaderProps) {
  return (
    <header className="article-header">
      <div className="article-header-meta">
        <span>{category}</span>
        <span>{readingTimeMinutes} min read</span>
      </div>
      <h1 className="marketing-heading">{displayTitle ?? title}</h1>
      <p className="article-header-description">{description}</p>
      <div className="article-byline">
        <span>{author}</span>
        <span>/</span>
        <span>{date}</span>
      </div>
      <div className="article-tags">
        {tags.map((tag, index) => (
          <span key={tag}>
            {index > 0 ? " / " : ""}
            {tag}
          </span>
        ))}
      </div>
    </header>
  );
}
