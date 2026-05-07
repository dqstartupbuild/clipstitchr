import Link from "next/link";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import {
  getBlogCategories,
  getFeaturedBlogPosts,
  getPublishedBlogPosts,
} from "@/lib/content/queries";

export const metadata = createPageMetadata({
  title: `Blog | ${site.name}`,
  description: `Articles, guides, and resources from the ${site.name} team. Stay up to date with our latest content and insights.`,
  canonical: "/blog",
});

/* ─── Empty State ─── */
function BlogEmptyState() {
  return (
    <div className="mt-14 py-20 text-center">
      <p className="text-2xl font-semibold text-text-primary">
        Nothing published yet.
      </p>
      <p className="mt-3 text-text-secondary">
        Working on it — check back soon.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block text-sm font-medium text-accent hover:text-accent-light"
      >
        ← Back to {site.name}
      </Link>
    </div>
  );
}

/* ─── Blog Index ─── */
export default function BlogIndexPage() {
  const posts = getPublishedBlogPosts();
  const featured = getFeaturedBlogPosts()[0] ?? posts[0];
  const categories = getBlogCategories();
  const isEmpty = posts.length === 0;

  return (
    <div className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-text-primary md:text-6xl">
            The {site.name} Blog.
          </h1>
          <p className="mt-6 text-lg leading-8 text-text-secondary">
            Articles, guides, and resources from our team.
          </p>
          {categories.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-text-tertiary">
              {categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-border px-3 py-1.5"
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
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
                  Featured article
                </p>
                <article className="mt-5 rounded-3xl border border-border bg-surface p-8 shadow-2xl shadow-black/15">
                  <p className="text-sm text-text-tertiary">
                    {featured.category} • {featured.readingTimeMinutes} min read
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-text-primary">
                    <Link href={featured.url} className="hover:text-accent">
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
                        className="rounded-full border border-border px-3 py-1 text-xs text-text-tertiary"
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
                  className="rounded-3xl border border-border bg-surface p-7 transition-transform duration-300 hover:-translate-y-1"
                >
                  <p className="text-sm text-text-tertiary">
                    {post.category} • {post.readingTimeMinutes} min read
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-text-primary">
                    <Link href={post.url} className="hover:text-accent">
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
                        className="rounded-full border border-border px-3 py-1 text-xs text-text-tertiary"
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
