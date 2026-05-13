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
    expect(urls).toContain("http://localhost:3000/docs");
    expect(urls).toContain("http://localhost:3000/docs/getting-started");
    expect(urls).toContain("http://localhost:3000/docs/stitchr");
    expect(urls).toContain("http://localhost:3000/docs/longr");
    expect(urls).toContain("http://localhost:3000/docs/clipr");
    expect(urls).toContain("http://localhost:3000/docs/swipr");
    expect(urls).toContain("http://localhost:3000/docs/swapr");
    expect(urls).toContain("http://localhost:3000/docs/avatars");
    expect(urls).toContain("http://localhost:3000/docs/rate-limits");
    expect(urls).not.toContain("http://localhost:3000/dashboard");
    expect(urls).not.toContain("http://localhost:3000/dashboard/avatars");
    expect(urls).not.toContain("http://localhost:3000/dashboard/stitchr");
    expect(urls).not.toContain("http://localhost:3000/dashboard/uploads");
    expect(urls).not.toContain("http://localhost:3000/dashboard/swapr");
    expect(urls).not.toContain("http://localhost:3000/dashboard/stitches");
  });
});
