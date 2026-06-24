import { escapeHtml } from "./escapeHtml";
import { isSafeMarkdownImageUrl } from "./isSafeMarkdownImageUrl";

export function renderMarkdownImageHtml(alt: string, url: string) {
  const src = url.trim();

  if (!isSafeMarkdownImageUrl(src)) {
    return null;
  }

  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" />`;
}
