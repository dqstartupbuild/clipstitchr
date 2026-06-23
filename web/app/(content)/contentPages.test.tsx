import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import BlogIndexPage from "@/app/(content)/blog/page";
import BlogPostPage, {
  generateMetadata as generateBlogPostMetadata,
  generateStaticParams as generateBlogPostStaticParams,
} from "@/app/(content)/blog/[slug]/page";
import CaseStudiesIndexPage from "@/app/(content)/case-studies/page";
import CaseStudyPage, {
  generateMetadata as generateCaseStudyMetadata,
  generateStaticParams as generateCaseStudyStaticParams,
} from "@/app/(content)/case-studies/[slug]/page";
import ContentLayout from "@/app/(content)/layout";
import DocsIndexPage from "@/app/(content)/docs/page";
import DocsArticlePage, {
  generateMetadata as generateDocsArticleMetadata,
  generateStaticParams as generateDocsArticleStaticParams,
} from "@/app/(content)/docs/[slug]/page";
import ExamplesIndexPage from "@/app/(content)/examples/page";
import ExampleOutputPage, {
  generateMetadata as generateExampleOutputMetadata,
  generateStaticParams as generateExampleOutputStaticParams,
} from "@/app/(content)/examples/[slug]/page";
import PricingPage from "@/app/(content)/pricing/page";
import PrivacyPage from "@/app/(content)/privacy/page";
import TermsPage from "@/app/(content)/terms/page";
import { BlogEmptyState } from "@/app/_components/content/BlogEmptyState";
import { getCustomerDocs } from "@/lib/clipstitchr/docs/getCustomerDocs";
import { getPublicVideoExamples } from "@/lib/clipstitchr/example-outputs/getPublicVideoExamples";
import { getPublishedCaseStudies } from "@/lib/content/caseStudyQueries";
import { getPublishedBlogPosts } from "@/lib/content/queries";

const mocks = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@content-collections/mdx/react", () => ({
  MDXContent: ({ code }: { code: string }) => (
    <div data-testid="mdx-content">{code.slice(0, 24)}</div>
  ),
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
}));

vi.mock("@/app/_components/HeaderAuthActions", () => ({
  HeaderAuthActions: ({ variant }: { variant?: string }) => (
    <span data-testid="header-auth-actions">{variant ?? "desktop"}</span>
  ),
}));

describe("content pages", () => {
  it("renders the blog index and article pages with generated metadata", async () => {
    const posts = getPublishedBlogPosts();
    const firstPost = posts[0];

    if (!firstPost) {
      throw new Error("Expected blog content.");
    }

    const indexMarkup = renderToStaticMarkup(await BlogIndexPage());
    const articleMarkup = renderToStaticMarkup(
      await BlogPostPage({
        params: Promise.resolve({ slug: firstPost.slug }),
      }),
    );

    expect(generateBlogPostStaticParams()).toContainEqual({
      slug: firstPost.slug,
    });
    await expect(
      generateBlogPostMetadata({
        params: Promise.resolve({ slug: firstPost.slug }),
      }),
    ).resolves.toEqual(expect.objectContaining({
      description: firstPost.description,
    }));
    expect(indexMarkup).toContain("The ClipStitchr Blog");
    expect(indexMarkup).toContain(firstPost.title);
    expect(articleMarkup).toContain(firstPost.title);
    expect(articleMarkup).toContain("Back to the blog");
  });

  it("returns empty metadata and notFound for missing blog posts", async () => {
    await expect(
      generateBlogPostMetadata({
        params: Promise.resolve({ slug: "missing-post" }),
      }),
    ).resolves.toEqual({});
    await expect(
      BlogPostPage({
        params: Promise.resolve({ slug: "missing-post" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders the case studies index and detail pages with generated metadata", async () => {
    const caseStudies = getPublishedCaseStudies();
    const firstCaseStudy = caseStudies[0];

    if (!firstCaseStudy) {
      throw new Error("Expected case study content.");
    }

    const indexMarkup = renderToStaticMarkup(<CaseStudiesIndexPage />);
    const detailMarkup = renderToStaticMarkup(
      await CaseStudyPage({
        params: Promise.resolve({ slug: firstCaseStudy.slug }),
      }),
    );

    expect(generateCaseStudyStaticParams()).toContainEqual({
      slug: firstCaseStudy.slug,
    });
    await expect(
      generateCaseStudyMetadata({
        params: Promise.resolve({ slug: firstCaseStudy.slug }),
      }),
    ).resolves.toEqual(expect.objectContaining({
      description: firstCaseStudy.description,
    }));
    expect(indexMarkup).toContain("Case studies");
    expect(indexMarkup).toContain(firstCaseStudy.title);
    expect(detailMarkup).toContain(firstCaseStudy.title);
    expect(detailMarkup).toContain("Back to case studies");
    expect(detailMarkup).toContain("Tools used");
  });

  it("returns empty metadata and notFound for missing case studies", async () => {
    await expect(
      generateCaseStudyMetadata({
        params: Promise.resolve({ slug: "missing-case-study" }),
      }),
    ).resolves.toEqual({});
    await expect(
      CaseStudyPage({
        params: Promise.resolve({ slug: "missing-case-study" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders docs index and article pages with generated metadata", async () => {
    const docs = getCustomerDocs();
    const firstDoc = docs[0];

    if (!firstDoc) {
      throw new Error("Expected customer docs.");
    }

    const indexMarkup = renderToStaticMarkup(<DocsIndexPage />);
    const articleMarkup = renderToStaticMarkup(
      await DocsArticlePage({
        params: Promise.resolve({ slug: firstDoc.slug }),
      }),
    );

    expect(generateDocsArticleStaticParams()).toContainEqual({
      slug: firstDoc.slug,
    });
    await expect(
      generateDocsArticleMetadata({
        params: Promise.resolve({ slug: firstDoc.slug }),
      }),
    ).resolves.toEqual(expect.objectContaining({
      title: expect.stringContaining(firstDoc.title),
    }));
    expect(indexMarkup).toContain("Start with the batch");
    expect(indexMarkup).toContain("What helps your batch");
    expect(indexMarkup).toContain(firstDoc.title);
    expect(indexMarkup).toContain("Clip Scores");
    expect(indexMarkup).toContain("Templates");
    expect(indexMarkup).toContain("Automation");
    expect(articleMarkup).toContain(firstDoc.title);
    expect(articleMarkup).toContain("Back to docs");
  });

  it("returns empty metadata and notFound for missing docs", async () => {
    await expect(
      generateDocsArticleMetadata({
        params: Promise.resolve({ slug: "missing-doc" }),
      }),
    ).resolves.toEqual({});
    await expect(
      DocsArticlePage({
        params: Promise.resolve({ slug: "missing-doc" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders example output pages with video metadata", async () => {
    const examples = getPublicVideoExamples();
    const firstExample = examples[0];

    if (!firstExample) {
      throw new Error("Expected example outputs.");
    }

    const indexMarkup = renderToStaticMarkup(<ExamplesIndexPage />);
    const exampleMarkup = renderToStaticMarkup(
      await ExampleOutputPage({
        params: Promise.resolve({ slug: firstExample.slug }),
      }),
    );

    expect(generateExampleOutputStaticParams()).toContainEqual({
      slug: firstExample.slug,
    });
    await expect(
      generateExampleOutputMetadata({
        params: Promise.resolve({ slug: firstExample.slug }),
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        description: firstExample.description,
      }),
    );
    expect(indexMarkup).toContain("Example outputs");
    expect(indexMarkup).toContain(firstExample.title);
    expect(exampleMarkup).toContain(firstExample.title);
    expect(exampleMarkup).toContain("VideoObject");
    expect(exampleMarkup).toContain(firstExample.videoSrc);
  });

  it("returns empty metadata and notFound for missing example outputs", async () => {
    await expect(
      generateExampleOutputMetadata({
        params: Promise.resolve({ slug: "missing-example" }),
      }),
    ).resolves.toEqual({});
    await expect(
      ExampleOutputPage({
        params: Promise.resolve({ slug: "missing-example" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders static content shells and legal pages", () => {
    const layoutMarkup = renderToStaticMarkup(
      <ContentLayout>
        <p>Content child</p>
      </ContentLayout>,
    );
    const pricingMarkup = renderToStaticMarkup(<PricingPage />);
    const privacyMarkup = renderToStaticMarkup(<PrivacyPage />);
    const termsMarkup = renderToStaticMarkup(<TermsPage />);
    const emptyMarkup = renderToStaticMarkup(<BlogEmptyState />);

    expect(layoutMarkup).toContain("Content child");
    expect(layoutMarkup).toContain("Blog");
    expect(layoutMarkup).toContain("Case Studies");
    expect(layoutMarkup).toContain("Pricing");
    expect(pricingMarkup).toContain(
      "Create more ad variants from the clips you already have",
    );
    expect(pricingMarkup).toContain("Stitchr batches from saved clips");
    expect(pricingMarkup).toContain("Clip scoring and video analysis");
    expect(pricingMarkup).toContain("$99");
    expect(pricingMarkup).toContain("250 credits/month");
    expect(pricingMarkup).toContain("10k Organic Views Challenge");
    expect(pricingMarkup).toContain("Boost");
    expect(pricingMarkup).toContain("150 credits");
    expect(privacyMarkup).toContain("Privacy Policy");
    expect(privacyMarkup).toContain("Media Processing and Storage");
    expect(termsMarkup).toContain("Terms of Use");
    expect(termsMarkup).toContain("Browser Processing Limits");
    expect(emptyMarkup).toContain("Nothing published yet.");
  });
});
