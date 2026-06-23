import { describe, expect, it } from "vitest";
import { renderMarkdownToHtml } from "./renderMarkdownToHtml";

describe("renderMarkdownToHtml", () => {
  it("renders headings, paragraphs, and inline emphasis", () => {
    const html = renderMarkdownToHtml(
      "# Title\n\nSome **bold** and *italic* text.",
    );

    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
    expect(html).toContain("<p>");
  });

  it("renders unordered and ordered lists", () => {
    const html = renderMarkdownToHtml("- one\n- two\n\n1. first\n2. second");

    expect(html).toContain("<ul><li>one</li><li>two</li></ul>");
    expect(html).toContain("<ol><li>first</li><li>second</li></ol>");
  });

  it("renders fenced code blocks without interpreting markdown", () => {
    const html = renderMarkdownToHtml("```\nconst a = **b**;\n```");

    expect(html).toContain("<pre><code>const a = **b**;</code></pre>");
    expect(html).not.toContain("<strong>");
  });

  it("renders safe links and blocks unsafe protocols", () => {
    const safe = renderMarkdownToHtml("[Docs](https://example.com)");
    const unsafe = renderMarkdownToHtml("[x](javascript:alert(1))");

    expect(safe).toContain('<a href="https://example.com">Docs</a>');
    expect(unsafe).not.toContain("<a ");
  });

  it("escapes raw html to prevent script injection", () => {
    const html = renderMarkdownToHtml("Hello <script>alert(1)</script>");

    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("strips leading frontmatter", () => {
    const html = renderMarkdownToHtml(
      "---\ntitle: x\n---\n\n# Body heading\n",
    );

    expect(html).toContain("<h1>Body heading</h1>");
    expect(html).not.toContain("title: x");
  });

  it("renders blockquotes and horizontal rules", () => {
    const html = renderMarkdownToHtml("> quoted line\n\n---");

    expect(html).toContain("<blockquote><p>quoted line</p></blockquote>");
    expect(html).toContain("<hr />");
  });
});
