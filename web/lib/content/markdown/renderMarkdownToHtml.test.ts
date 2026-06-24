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

  it("keeps signed image urls intact while rendering inline markdown", () => {
    const imageUrl =
      "https://assets.example.com/user_123/blog-images/image.png?X-Amz-Credential=abc%2Fauto%2Fs3%2Faws4_request&x-id=GetObject";
    const html = renderMarkdownToHtml(`![Signed image](${imageUrl})`);

    expect(html).toContain(`src="${imageUrl.replaceAll("&", "&amp;")}"`);
    expect(html).toContain('alt="Signed image"');
    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain("<em>");
  });

  it("renders youtube urls as lazy embed iframes", () => {
    const html = renderMarkdownToHtml("https://youtu.be/-PgBfGXEyzE");

    expect(html).toContain('class="runtime-blog-embed"');
    expect(html).toContain(
      'src="https://www.youtube-nocookie.com/embed/-PgBfGXEyzE"',
    );
    expect(html).toContain('loading="lazy"');
  });

  it("renders youtube iframe blocks as safe embeds", () => {
    const html = renderMarkdownToHtml(
      [
        "<iframe",
        '  src="https://www.youtube.com/embed/o6Nd8pGI2VY"',
        '  title="Shorts vs Long-Form Videos"',
        "/>",
      ].join("\n"),
    );

    expect(html).toContain(
      'src="https://www.youtube-nocookie.com/embed/o6Nd8pGI2VY"',
    );
    expect(html).toContain('title="Shorts vs Long-Form Videos"');
    expect(html).not.toContain("&lt;iframe");
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

  it("renders heading anchors and markdown tables", () => {
    const html = renderMarkdownToHtml(
      "## Section {#section}\n\n| Result | Outcome |\n| --- | --- |\n| Views | 161K |",
    );

    expect(html).toContain('<h2 id="section">Section</h2>');
    expect(html).toContain("<table>");
    expect(html).toContain("<th>Result</th>");
    expect(html).toContain("<td>161K</td>");
  });
});
