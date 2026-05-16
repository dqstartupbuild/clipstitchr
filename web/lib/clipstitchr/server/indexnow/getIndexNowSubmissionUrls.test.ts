import { describe, expect, it } from "vitest";
import { getIndexNowSubmissionUrls } from "@/lib/clipstitchr/server/indexnow/getIndexNowSubmissionUrls";

describe("getIndexNowSubmissionUrls", () => {
  it("returns public sitemap URLs for the configured host", () => {
    const urls = getIndexNowSubmissionUrls("http://localhost:3000");

    expect(urls).toContain("http://localhost:3000/");
    expect(urls).toContain("http://localhost:3000/blog");
    expect(urls).toContain("http://localhost:3000/docs/stitchr");
    expect(urls).not.toContain("http://localhost:3000/dashboard");
    expect(urls.every((url) => new URL(url).host === "localhost:3000")).toBe(
      true,
    );
  });

  it("rejects sitemap URLs from another host", () => {
    expect(() => getIndexNowSubmissionUrls("https://clipstitchr.com")).toThrow(
      "IndexNow can only submit sitemap URLs from clipstitchr.com",
    );
  });
});
