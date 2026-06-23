import { describe, expect, it } from "vitest";
import { renderRuntimeBlogContent } from "./renderRuntimeBlogContent";

describe("renderRuntimeBlogContent", () => {
  it("returns html content directly for the html format", () => {
    const html = renderRuntimeBlogContent({
      contentFormat: "html",
      content: "<p>Already html</p>",
    });

    expect(html).toBe("<p>Already html</p>");
  });

  it("prefers provided content html when present for markdown", () => {
    const html = renderRuntimeBlogContent({
      contentFormat: "markdown",
      content: "# Heading",
      contentHtml: "<p>Pre-rendered</p>",
    });

    expect(html).toBe("<p>Pre-rendered</p>");
  });

  it("converts markdown to html when no html is provided", () => {
    const html = renderRuntimeBlogContent({
      contentFormat: "markdown",
      content: "# Heading",
    });

    expect(html).toContain("<h1>Heading</h1>");
  });

  it("converts mdx body content to html", () => {
    const html = renderRuntimeBlogContent({
      contentFormat: "mdx",
      content: "## Section\n\nBody",
    });

    expect(html).toContain("<h2>Section</h2>");
    expect(html).toContain("<p>Body</p>");
  });
});
