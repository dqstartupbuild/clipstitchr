import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXContent } from "@content-collections/mdx/react";
import {
  getBlogPostBySlug,
  getPublishedBlogPosts,
  getRelatedBlogPosts,
} from "@/lib/content/queries";
import {
  createArticleJsonLd,
  createContentMetadata,
  createFaqJsonLd,
} from "@/lib/content/seo";
import { mdxComponents } from "@/lib/content/mdx-components";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPublishedBlogPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {};
  }

  return createContentMetadata(post);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedBlogPosts(post);
  const structuredData = [createArticleJsonLd(post), createFaqJsonLd(post)].filter(
    Boolean,
  );

  return (
    <div className="px-6 py-16 md:py-24">
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}

      <div className="mx-auto max-w-3xl">
        <Link href="/blog" className="text-sm text-text-tertiary hover:text-accent">
          ← Back to the blog
        </Link>

        <header className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            {post.category}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-text-primary md:text-6xl">
            {post.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-text-secondary">
            {post.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-text-tertiary">
            <span>{post.author}</span>
            <span>•</span>
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readingTimeMinutes} min read</span>
          </div>
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
        </header>

        <article className="mt-12 space-y-6">
          <MDXContent code={post.body} components={mdxComponents} />
        </article>

        {post.faq?.length ? (
          <section className="mt-16 rounded-3xl border border-border bg-surface p-8">
            <h2 className="text-2xl font-semibold text-text-primary">
              Frequently asked questions
            </h2>
            <div className="mt-8 space-y-6">
              {post.faq.map((entry) => (
                <div key={entry.question}>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {entry.question}
                  </h3>
                  <p className="mt-2 leading-8 text-text-secondary">
                    {entry.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {relatedPosts.length ? (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold text-text-primary">
              Keep reading
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={relatedPost.url}
                  className="rounded-3xl border border-border bg-surface p-6 transition-transform duration-300 hover:-translate-y-1"
                >
                  <p className="text-sm text-text-tertiary">
                    {relatedPost.category}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-text-primary">
                    {relatedPost.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">
                    {relatedPost.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
