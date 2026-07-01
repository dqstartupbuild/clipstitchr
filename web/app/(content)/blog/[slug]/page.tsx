import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXContent } from "@content-collections/mdx/react";
import { RuntimeBlogArticle } from "@/app/_components/content/RuntimeBlogArticle";
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
import { fetchConvexBlogPostBySlug } from "@/lib/content/runtimeBlog/fetchConvexBlogPostBySlug";
import { createRuntimeBlogPostMetadata } from "@/lib/content/runtimeBlog/createRuntimeBlogPostMetadata";
import { toRuntimeBlogPostFromConvex } from "@/lib/content/runtimeBlog/toRuntimeBlogPostFromConvex";

export const revalidate = 3600;
export const dynamicParams = true;

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
  const mdxPost = getBlogPostBySlug(slug);

  if (mdxPost) {
    return createContentMetadata(mdxPost);
  }

  const convexPost = await fetchConvexBlogPostBySlug(slug);

  if (!convexPost) {
    return {};
  }

  const runtimePost = toRuntimeBlogPostFromConvex(convexPost);

  return createRuntimeBlogPostMetadata(runtimePost);
}

type ArticleHeaderProps = {
  category: string;
  title: string;
  description: string;
  author: string;
  date: string;
  readingTimeMinutes: number;
  tags: string[];
};

function ArticleHeader({
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
      <p className="text-sm font-semibold text-accent-dark">{category}</p>
      <h1 className="mt-4 text-4xl font-bold text-text-primary md:text-5xl">
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
            className="rounded-md border border-border bg-white px-3 py-1 text-xs text-text-tertiary"
          >
            {tag}
          </span>
        ))}
      </div>
    </header>
  );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (post) {
    const relatedPosts = getRelatedBlogPosts(post);
    const structuredData = [
      createArticleJsonLd(post),
      createFaqJsonLd(post),
    ].filter(Boolean);

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
          <Link
            href="/blog"
            className="text-sm font-semibold text-text-tertiary hover:text-accent"
          >
            Back to the blog
          </Link>

          <ArticleHeader
            category={post.category}
            title={post.title}
            description={post.description}
            author={post.author}
            date={post.date}
            readingTimeMinutes={post.readingTimeMinutes}
            tags={post.tags}
          />

          <article className="mt-12 space-y-6">
            <MDXContent code={post.body} components={mdxComponents} />
          </article>

          {post.faq?.length ? (
            <section className="mt-16 rounded-lg border border-border bg-surface p-8">
              <h2 className="text-2xl font-bold text-text-primary">
                Frequently asked questions
              </h2>
              <div className="mt-8 space-y-6">
                {post.faq.map((entry) => (
                  <div key={entry.question}>
                    <h3 className="text-lg font-bold text-text-primary">
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
              <h2 className="text-2xl font-bold text-text-primary">
                Keep reading
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={relatedPost.url}
                    className="rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent"
                  >
                    <p className="text-sm text-text-tertiary">
                      {relatedPost.category}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-text-primary">
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

  const convexPost = await fetchConvexBlogPostBySlug(slug);

  if (!convexPost) {
    notFound();
  }

  const runtimePost = toRuntimeBlogPostFromConvex(convexPost);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: runtimePost.title,
    description: runtimePost.description,
    datePublished: runtimePost.date,
    dateModified: runtimePost.updated ?? runtimePost.date,
    mainEntityOfPage: runtimePost.canonical,
    keywords: runtimePost.tags.join(", "),
    ...(runtimePost.image ? { image: [runtimePost.image] } : {}),
  };

  return (
    <div className="px-6 py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="mx-auto max-w-3xl">
        <Link
          href="/blog"
          className="text-sm font-semibold text-text-tertiary hover:text-accent"
        >
          Back to the blog
        </Link>

        <ArticleHeader
          category={runtimePost.category}
          title={runtimePost.title}
          description={runtimePost.description}
          author={runtimePost.author}
          date={runtimePost.date}
          readingTimeMinutes={runtimePost.readingTimeMinutes}
          tags={runtimePost.tags}
        />

        {runtimePost.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={runtimePost.image}
            alt={runtimePost.title}
            className="mt-10 w-full rounded-2xl border border-border"
            loading="lazy"
          />
        ) : null}

        <RuntimeBlogArticle html={runtimePost.bodyHtml} />
      </div>
    </div>
  );
}
