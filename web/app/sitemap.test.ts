import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("covers the home page, blog index, and seeded blog posts", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("http://localhost:3000/");
    expect(urls).toContain("http://localhost:3000/blog");
    expect(urls).toContain(
      "http://localhost:3000/blog/getting-started",
    );
  });
});
