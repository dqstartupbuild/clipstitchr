import { describe, expect, it } from "vitest";
import { GET as getFeed } from "@/app/feed.xml/route";
import { GET as getLlmsTxt } from "@/app/llms.txt/route";
import { GET as getVideoSitemap } from "@/app/video-sitemap.xml/route";

describe("static metadata routes", () => {
  it("serves the RSS feed with XML cache headers", async () => {
    const response = getFeed();
    const body = await response.text();

    expect(response.headers.get("content-type")).toBe(
      "application/rss+xml; charset=utf-8",
    );
    expect(response.headers.get("cache-control")).toContain("s-maxage=3600");
    expect(body).toContain("<rss");
    expect(body).toContain("ClipStitchr");
  });

  it("serves llms.txt with plain text cache headers", async () => {
    const response = getLlmsTxt();
    const body = await response.text();

    expect(response.headers.get("content-type")).toBe(
      "text/plain; charset=utf-8",
    );
    expect(response.headers.get("cache-control")).toContain("s-maxage=3600");
    expect(body).toContain("# ClipStitchr");
  });

  it("serves the video sitemap with example output metadata", async () => {
    const response = getVideoSitemap();
    const body = await response.text();

    expect(response.headers.get("content-type")).toBe(
      "application/xml; charset=utf-8",
    );
    expect(response.headers.get("cache-control")).toContain("s-maxage=3600");
    expect(body).toContain("<video:video>");
    expect(body).toContain(
      "http://localhost:3000/examples/stitchr-boyfriend-ten-out-of-ten",
    );
    expect(body).toContain(
      "http://localhost:3000/example-outputs/clipstitchr-example-11.webm",
    );
  });
});
