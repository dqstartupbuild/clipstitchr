import { escapeHtml } from "./escapeHtml";
import { isSafeMarkdownUrl } from "./isSafeMarkdownUrl";

export function renderMarkdownLinkHtml(label: string, url: string) {
  const href = url.trim();

  if (!isSafeMarkdownUrl(href)) {
    return null;
  }

  return `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
}
