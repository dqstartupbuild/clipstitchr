import { extractHtmlAttribute } from "./extractHtmlAttribute";
import { renderYouTubeEmbedHtml } from "./renderYouTubeEmbedHtml";

export function renderYouTubeIframeBlock(html: string) {
  const src = extractHtmlAttribute(html, "src");

  if (!src) {
    return null;
  }

  return renderYouTubeEmbedHtml(
    src,
    extractHtmlAttribute(html, "title") ?? "YouTube video",
  );
}
