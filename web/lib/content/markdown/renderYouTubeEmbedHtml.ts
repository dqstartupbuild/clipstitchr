import { escapeHtml } from "./escapeHtml";
import { getYouTubeEmbedUrl } from "./getYouTubeEmbedUrl";

export function renderYouTubeEmbedHtml(url: string, title = "YouTube video") {
  const embedUrl = getYouTubeEmbedUrl(url);

  if (!embedUrl) {
    return null;
  }

  const safeTitle = title.trim() || "YouTube video";

  return [
    '<div class="runtime-blog-embed">',
    `<iframe src="${escapeHtml(embedUrl)}" title="${escapeHtml(safeTitle)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`,
    "</div>",
  ].join("");
}
