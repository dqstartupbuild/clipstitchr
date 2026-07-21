import { describe, expect, it } from "vitest";
import { extractHookLabSourceUrl } from "./extractHookLabSourceUrl";

describe("extractHookLabSourceUrl", () => {
  it("extracts a shared link from surrounding mobile share text", () => {
    expect(
      extractHookLabSourceUrl(
        "Watch this post https://vt.tiktok.com/ZSHared123/ and tell me what you think.",
      ),
    ).toBe("https://vt.tiktok.com/ZSHared123/");
  });

  it("keeps a plain URL unchanged", () => {
    expect(
      extractHookLabSourceUrl("https://www.instagram.com/reel/ABC123/"),
    ).toBe("https://www.instagram.com/reel/ABC123/");
  });
});
