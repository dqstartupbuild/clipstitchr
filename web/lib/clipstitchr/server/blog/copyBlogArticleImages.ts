import { collectBlogImageSourceUrls } from "./collectBlogImageSourceUrls";
import { copyBlogImageSource } from "./copyBlogImageSource";
import type { NormalizedBlogArticle } from "./normalizeBlogArticle";
import { rewriteBlogArticleImageUrls } from "./rewriteBlogArticleImageUrls";

export async function copyBlogArticleImages(
  article: NormalizedBlogArticle,
): Promise<NormalizedBlogArticle> {
  const sourceUrls = collectBlogImageSourceUrls(article);

  if (!sourceUrls.length) {
    return article;
  }

  const replacements = new Map<string, string>();

  for (const sourceUrl of sourceUrls) {
    replacements.set(
      sourceUrl,
      await copyBlogImageSource({
        slug: article.slug,
        sourceUrl,
      }),
    );
  }

  return rewriteBlogArticleImageUrls(article, replacements);
}
