import { describe, expect, it } from "vitest";
import { normalizeHookLabAuthorProfileUrl } from "@/lib/clipstitchr/server/hookLab/normalizeHookLabAuthorProfileUrl";

describe("normalizeHookLabAuthorProfileUrl", () => {
  it("keeps canonical profiles on the expected platform", () => {
    expect(
      normalizeHookLabAuthorProfileUrl(
        "https://m.tiktok.com/@Creator.Name?lang=en",
        "tiktok",
      ),
    ).toBe("https://www.tiktok.com/@creator.name");
    expect(
      normalizeHookLabAuthorProfileUrl(
        "https://instagram.com/Creator.Name/?utm_source=test",
        "instagram",
      ),
    ).toBe("https://www.instagram.com/creator.name/");
  });

  it.each([
    "javascript:alert(1)",
    "http://www.instagram.com/creator/",
    "https://evil.example/@creator",
    "https://www.instagram.com/reel/ABC123/",
  ])("rejects unsafe or non-profile attribution URL %s", (url) => {
    expect(normalizeHookLabAuthorProfileUrl(url, "instagram")).toBeUndefined();
  });
});
