import { renderMarkdownToHtml } from "@/lib/content/markdown/renderMarkdownToHtml";

type RenderRuntimeBlogContentInput = {
  contentFormat: "mdx" | "markdown" | "html";
  content: string;
  contentHtml?: string;
};

export function renderRuntimeBlogContent({
  contentFormat,
  content,
  contentHtml,
}: RenderRuntimeBlogContentInput) {
  if (contentFormat === "html") {
    return content;
  }

  if (contentHtml && contentHtml.trim().length > 0) {
    return contentHtml;
  }

  return renderMarkdownToHtml(content);
}
