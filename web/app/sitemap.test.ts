import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("covers the home page, app pages, blog index, and seeded blog posts", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("http://localhost:3000/");
    expect(urls).toContain("http://localhost:3000/dashboard");
    expect(urls).toContain("http://localhost:3000/dashboard/create");
    expect(urls).toContain("http://localhost:3000/uploads");
    expect(urls).toContain("http://localhost:3000/created");
    expect(urls).toContain("http://localhost:3000/blog");
    expect(urls).toContain(
      "http://localhost:3000/blog/getting-started",
    );
  });
});
