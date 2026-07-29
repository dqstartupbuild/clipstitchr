import { describe, expect, it } from "vitest";
import { extractBlogHeadings } from "./extractBlogHeadings";

describe("extractBlogHeadings", () => {
  it("returns an empty array when there are no headings", () => {
    expect(extractBlogHeadings("<p>Just a paragraph.</p>")).toEqual([]);
  });

  it("extracts headings with auto-generated ids", () => {
    const html = "<h2>Getting Started</h2><p>Body</p>";
    const headings = extractBlogHeadings(html);

    expect(headings).toEqual([
      { id: "getting-started", text: "Getting Started", level: 2 },
    ]);
  });

  it("preserves explicit heading ids when present", () => {
    const html = '<h2 id="custom-id">Custom Heading</h2>';
    const headings = extractBlogHeadings(html);

    expect(headings).toEqual([
      { id: "custom-id", text: "Custom Heading", level: 2 },
    ]);
  });

  it("captures table-of-contents heading levels from h2 through h6", () => {
    const html = [
      "<h1>One</h1>",
      "<h2>Two</h2>",
      "<h3>Three</h3>",
      "<h4>Four</h4>",
      "<h5>Five</h5>",
      "<h6>Six</h6>",
    ].join("");

    const headings = extractBlogHeadings(html);

    expect(headings.map((heading) => heading.level)).toEqual([2, 3, 4, 5, 6]);
  });

  it("strips inline html from heading text", () => {
    const html = "<h2>Hello <strong>World</strong></h2>";
    const headings = extractBlogHeadings(html);

    expect(headings[0]?.text).toBe("Hello World");
  });

  it("decodes basic html entities in heading text", () => {
    const html = "<h2>Q&amp;A: Getting Started</h2>";
    const headings = extractBlogHeadings(html);

    expect(headings[0]?.text).toBe("Q&A: Getting Started");
    expect(headings[0]?.id).toBe("qa-getting-started");
  });

  it("de-duplicates repeated heading ids", () => {
    const html = "<h2>Section</h2><h2>Section</h2><h2>Section</h2>";
    const headings = extractBlogHeadings(html);

    expect(headings.map((heading) => heading.id)).toEqual([
      "section",
      "section-2",
      "section-3",
    ]);
  });

  it("skips empty headings", () => {
    const html = "<h2></h2><h2>Real Heading</h2>";
    const headings = extractBlogHeadings(html);

    expect(headings).toEqual([
      { id: "real-heading", text: "Real Heading", level: 2 },
    ]);
  });
});
