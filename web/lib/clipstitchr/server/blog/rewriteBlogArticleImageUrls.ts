import type { NormalizedBlogArticle } from "./normalizeBlogArticle";
import { extractFrontmatterImageUrls } from "./extractFrontmatterImageUrls";
import { rewriteFrontmatterImageUrls } from "./rewriteFrontmatterImageUrls";
import { rewriteMarkdownImageUrls } from "./rewriteMarkdownImageUrls";

export function rewriteBlogArticleImageUrls(
  article: NormalizedBlogArticle,
  replacements: ReadonlyMap<string, string>,
): NormalizedBlogArticle {
  const frontmatterImageUrl = extractFrontmatterImageUrls(article.content)[0];
  const contentWithFrontmatter = rewriteFrontmatterImageUrls(
    article.content,
    replacements,
  );
  const content = rewriteMarkdownImageUrls(contentWithFrontmatter, replacements);
  const imageUrl = article.imageUrl
    ? replacements.get(article.imageUrl)
    : frontmatterImageUrl
      ? replacements.get(frontmatterImageUrl)
      : undefined;

  return {
    ...article,
    content,
    imageUrl,
  };
}
