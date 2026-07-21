import { describe, expect, it } from "vitest";
import { canonicalizeHookLabSourceUrl } from "@/lib/clipstitchr/server/hookLab/canonicalizeHookLabSourceUrl";

describe("canonicalizeHookLabSourceUrl", () => {
  it("removes tracking data and normalizes supported host and path variants", () => {
    expect(
      canonicalizeHookLabSourceUrl(
        " https://m.tiktok.com/@Creator/video/7412345678901234567?lang=en#video ",
      ),
    ).toBe("https://www.tiktok.com/@creator/video/7412345678901234567");
    expect(
      canonicalizeHookLabSourceUrl(
        "https://instagram.com/reels/ABC_123/?utm_source=ig_web_copy_link",
      ),
    ).toBe("https://www.instagram.com/reel/ABC_123/");
    expect(
      canonicalizeHookLabSourceUrl(
        "Shared from TikTok: https://vt.tiktok.com/ZSHared123/?_r=1",
      ),
    ).toBe("https://vt.tiktok.com/ZSHared123/");
    expect(
      canonicalizeHookLabSourceUrl(
        "https://www.tiktok.com/@Creator/photo/7412345678901234567?_t=abc",
      ),
    ).toBe("https://www.tiktok.com/@creator/photo/7412345678901234567");
    expect(
      canonicalizeHookLabSourceUrl(
        "https://www.instagram.com/share/reel/ABC_123/?igsh=abc",
      ),
    ).toBe("https://www.instagram.com/share/reel/ABC_123/");
  });

  it("throws for unsupported links", () => {
    expect(() =>
      canonicalizeHookLabSourceUrl("https://www.instagram.com/creator/"),
    ).toThrow("Paste a public TikTok or Instagram post link.");
  });
});
