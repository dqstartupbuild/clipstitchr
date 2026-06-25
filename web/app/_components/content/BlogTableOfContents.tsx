import type { BlogHeading } from "@/lib/content/runtimeBlog/extractBlogHeadings";

type BlogTableOfContentsProps = {
  headings: BlogHeading[];
};

export function BlogTableOfContents({ headings }: BlogTableOfContentsProps) {
  if (headings.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Table of contents"
      className="mt-10 rounded-2xl border border-border bg-surface p-6"
    >
      <p className="text-sm font-semibold text-accent-dark">On this page</p>
      <ul className="mt-4 space-y-2 text-sm text-text-secondary">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={
              heading.level >= 3 ? "ml-4 text-text-tertiary" : undefined
            }
          >
            <a
              href={`#${heading.id}`}
              className="block leading-6 transition-colors hover:text-accent"
              data-blog-toc-link="true"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}