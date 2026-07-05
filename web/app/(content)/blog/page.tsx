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
    <div className="marketing-grid-bg px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="marketing-eyebrow">Resources</p>
          <h1 className="marketing-heading mt-6 text-5xl text-text-primary md:text-7xl">
            Notes on doing content when you would rather not.
          </h1>
          <p className="mt-6 text-lg leading-8 text-text-secondary">
            Practical notes on clips, demos, short-form ads, and the parts of
            content work that make builders procrastinate.
          </p>
          {categories.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-text-tertiary">
              {categories.map((category) => (
                <span
                  key={category}
                  className="rounded-md border border-border bg-surface px-3 py-1.5"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>

        {isEmpty ? (
          <BlogEmptyState />
        ) : (
          <>
            {featured ? (
              <section className="mt-14">
                <p className="text-sm font-semibold text-accent-dark">
                  Featured article
                </p>
                <article className="marketing-card mt-5 p-8">
                  <p className="text-sm text-text-tertiary">
                    {featured.category} . {featured.readingTimeMinutes} min read
                  </p>
                  <h2 className="marketing-subheading mt-3 text-4xl text-text-primary">
                    <Link href={featured.url} className="hover:text-accent-dark">
                      {featured.title}
                    </Link>
                  </h2>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-text-secondary">
                    {featured.description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {featured.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-border bg-surface-muted px-3 py-1 text-xs text-text-tertiary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              </section>
            ) : null}

            <section className="mt-14 grid gap-6 md:grid-cols-2">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="marketing-card p-7 transition-colors hover:border-accent"
                >
                  <p className="text-sm text-text-tertiary">
                    {post.category} . {post.readingTimeMinutes} min read
                  </p>
                  <h2 className="marketing-subheading mt-3 text-3xl text-text-primary">
                    <Link href={post.url} className="hover:text-accent-dark">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-4 text-base leading-8 text-text-secondary">
                    {post.description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-border bg-surface-muted px-3 py-1 text-xs text-text-tertiary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
