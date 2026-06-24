import type { NormalizedBlogArticle } from "./normalizeBlogArticle";
import { extractFrontmatterImageUrls } from "./extractFrontmatterImageUrls";
import { extractMarkdownImageUrls } from "./extractMarkdownImageUrls";

export function collectBlogImageSourceUrls(article: NormalizedBlogArticle) {
  const urls = new Set<string>();

  if (article.imageUrl) {
    urls.add(article.imageUrl);
  }

  for (const url of extractFrontmatterImageUrls(article.content)) {
    urls.add(url);
  }

  for (const url of extractMarkdownImageUrls(article.content)) {
    urls.add(url);
  }

  return Array.from(urls);
}
