import Link from "next/link";
import { BlogEmptyState } from "@/app/_components/content/BlogEmptyState";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { getBlogPostCards } from "@/lib/content/runtimeBlog/getBlogPostCards";

export const revalidate = 3600;

export const metadata = createPageMetadata({
  title: `Blog | ${site.name}`,
  description: `Founder notes and practical guides from ${site.name} on making short-form ads when editing content is the part you hate.`,
  canonical: "/blog",
});

export default async function BlogIndexPage() {
  const posts = await getBlogPostCards();
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const categories = Array.from(
    new Set(posts.map((post) => post.category)),
  ).sort();
  const isEmpty = posts.length === 0;

  return (
    <div className="blog-index-page">
      <div className="blog-index-inner">
        <header className="blog-index-hero">
          <p>Notes from the production floor</p>
          <h1 className="marketing-heading">Useful notes. No theater.</h1>
          <div>
            <p>
              Practical notes on clips, demos, short-form ads, and the parts of
              content work that make builders procrastinate.
            </p>
            {categories.length > 0 && (
              <div className="blog-category-line">
                {categories.map((category, index) => (
                  <span key={category}>
                    {index > 0 ? " / " : ""}
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {isEmpty ? (
          <BlogEmptyState />
        ) : (
          <>
            {featured ? (
              <section className="blog-featured-section">
                <p>Read this first</p>
                <article className="blog-featured-article">
                  <p>
                    {featured.category} . {featured.readingTimeMinutes} min read
                  </p>
                  <h2>
                    <Link href={featured.url}>{featured.title}</Link>
                  </h2>
                  <p>{featured.description}</p>
                  <Link href={featured.url}>Read the note</Link>
                </article>
              </section>
            ) : null}

            <section className="blog-note-list">
              {posts.map((post, index) => (
                <article key={post.slug} className="blog-note-row">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>
                    {post.category} . {post.readingTimeMinutes} min read
                  </p>
                  <h2>
                    <Link href={post.url}>{post.title}</Link>
                  </h2>
                  <p>{post.description}</p>
                  <Link href={post.url}>Read</Link>
                </article>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
