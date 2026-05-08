import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("covers public pages and excludes authenticated dashboard pages", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("http://localhost:3000/");
    expect(urls).toContain("http://localhost:3000/blog");
    expect(urls).toContain(
      "http://localhost:3000/blog/getting-started",
    );
    expect(urls).not.toContain("http://localhost:3000/dashboard");
    expect(urls).not.toContain("http://localhost:3000/dashboard/stitchr");
    expect(urls).not.toContain("http://localhost:3000/dashboard/uploads");
    expect(urls).not.toContain("http://localhost:3000/dashboard/swapr");
    expect(urls).not.toContain("http://localhost:3000/dashboard/stitches");
  });
});
