import { renderMarkdownToHtml } from "@/lib/content/markdown/renderMarkdownToHtml";
import { stripRuntimeBlogTitleHeading } from "./stripRuntimeBlogTitleHeading";

type RenderRuntimeBlogContentInput = {
  contentFormat: "mdx" | "markdown" | "html";
  content: string;
  contentHtml?: string;
  title?: string;
};

export function renderRuntimeBlogContent({
  contentFormat,
  content,
  contentHtml,
  title,
}: RenderRuntimeBlogContentInput) {
  let html: string;

  if (contentFormat === "html") {
    html = content;
  } else if (contentHtml && contentHtml.trim().length > 0) {
    html = contentHtml;
  } else {
    html = renderMarkdownToHtml(content);
  }

  if (!title) {
    return html;
  }

  return stripRuntimeBlogTitleHeading(html, title);
}
