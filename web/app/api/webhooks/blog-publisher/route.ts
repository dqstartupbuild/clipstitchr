import { revalidatePath } from "next/cache";
import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { copyBlogArticleImages } from "@/lib/clipstitchr/server/blog/copyBlogArticleImages";
import { createBlogPublishRateLimitKey } from "@/lib/clipstitchr/server/blog/createBlogPublishRateLimitKey";
import { getIsAuthorizedBlogPublishRequest } from "@/lib/clipstitchr/server/blog/getIsAuthorizedBlogPublishRequest";
import { normalizeBlogArticle } from "@/lib/clipstitchr/server/blog/normalizeBlogArticle";
import { parseBlogPublishPayload } from "@/lib/clipstitchr/server/blog/parseBlogPublishPayload";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export const runtime = "nodejs";

function createInvalidTokenResponse() {
  return Response.json({ error: "Invalid access token." }, { status: 401 });
}

export async function POST(request: Request) {
  if (!getIsAuthorizedBlogPublishRequest(request)) {
    return createInvalidTokenResponse();
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  try {
    const articles = parseBlogPublishPayload(payload);
    const normalizedArticles = articles.map(normalizeBlogArticle);
    const rateLimitSecret = getRateLimitApiSecret();
    const convex = createConvexHttpClient();

    await convex.mutation(api.rateLimits.consumeBlogPublishWebhook, {
      key: createBlogPublishRateLimitKey(request),
      secret: rateLimitSecret,
      articleCount: normalizedArticles.length,
    });

    const publishedSlugs: string[] = [];

    for (const normalizedArticle of normalizedArticles) {
      const article = await copyBlogArticleImages(normalizedArticle);

      await convex.mutation(api.blogPosts.upsertPublishedArticle, {
        secret: rateLimitSecret,
        slug: article.slug,
        externalId: article.externalId,
        title: article.title,
        metaDescription: article.metaDescription,
        contentFormat: article.contentFormat,
        content: article.content,
        contentHtml: article.contentHtml,
        imageUrl: article.imageUrl,
        tags: article.tags,
        source: article.source,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      });

      publishedSlugs.push(article.slug);
    }

    revalidatePath("/blog");
    revalidatePath("/feed.xml");
    revalidatePath("/sitemap.xml");

    for (const slug of publishedSlugs) {
      revalidatePath(`/blog/${slug}`);
    }

    return Response.json({ message: "Published." });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to publish the blog articles.",
      },
      { status: 400 },
    );
  }
}
