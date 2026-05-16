import { describe, expect, it } from "vitest";
import { createIndexNowPayload } from "@/lib/clipstitchr/server/indexnow/createIndexNowPayload";
import { indexNowKey } from "@/lib/clipstitchr/server/indexnow/indexNowKey";
import { maxIndexNowUrlCount } from "@/lib/clipstitchr/server/indexnow/maxIndexNowUrlCount";

describe("createIndexNowPayload", () => {
  it("creates the IndexNow JSON payload for the configured host", () => {
    const urls = [
      "https://clipstitchr.com/",
      "https://clipstitchr.com/blog",
    ];

    expect(
      createIndexNowPayload({
        siteUrl: "https://clipstitchr.com",
        urls,
      }),
    ).toEqual({
      host: "clipstitchr.com",
      key: indexNowKey,
      keyLocation: `https://clipstitchr.com/${indexNowKey}.txt`,
      urlList: urls,
    });
  });

  it("rejects empty submissions", () => {
    expect(() =>
      createIndexNowPayload({
        siteUrl: "https://clipstitchr.com",
        urls: [],
      }),
    ).toThrow("No public URLs are available for IndexNow submission.");
  });

  it("rejects submissions above the IndexNow URL limit", () => {
    expect(() =>
      createIndexNowPayload({
        siteUrl: "https://clipstitchr.com",
        urls: Array.from(
          { length: maxIndexNowUrlCount + 1 },
          (_, index) => `https://clipstitchr.com/page-${index}`,
        ),
      }),
    ).toThrow(`IndexNow submissions are limited to ${maxIndexNowUrlCount} URLs.`);
  });
});
