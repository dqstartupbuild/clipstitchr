import { describe, expect, it } from "vitest";
import { getHookLabSourcePlatform } from "@/lib/clipstitchr/server/hookLab/getHookLabSourcePlatform";

describe("getHookLabSourcePlatform", () => {
  it("detects supported TikTok and Instagram post-link variants", () => {
    expect(
      getHookLabSourcePlatform(
        "https://www.tiktok.com/@creator/video/7412345678901234567?lang=en",
      ),
    ).toBe("tiktok");
    expect(
      getHookLabSourcePlatform("https://www.instagram.com/p/ABC_123/?utm_source=ig_web"),
    ).toBe("instagram");
    expect(
      getHookLabSourcePlatform("https://instagram.com/reels/ABC-123/"),
    ).toBe("instagram");
    expect(
      getHookLabSourcePlatform("https://www.tiktok.com/@creator/photo/7412345678901234567"),
    ).toBe("tiktok");
    expect(getHookLabSourcePlatform("https://vt.tiktok.com/ZSHared123/"))
      .toBe("tiktok");
    expect(getHookLabSourcePlatform("https://www.tiktok.com/t/ZSHared123/"))
      .toBe("tiktok");
    expect(
      getHookLabSourcePlatform("https://www.instagram.com/share/reel/ABC123/?igsh=test"),
    ).toBe("instagram");
    expect(
      getHookLabSourcePlatform("https://instagr.am/p/ABC123/"),
    ).toBe("instagram");
  });

  it("rejects profiles, insecure links, and other hosts", () => {
    expect(getHookLabSourcePlatform("https://www.tiktok.com/@creator")).toBeNull();
    expect(getHookLabSourcePlatform("https://www.instagram.com/creator/")).toBeNull();
    expect(
      getHookLabSourcePlatform("http://www.instagram.com/reel/ABC123/"),
    ).toBeNull();
    expect(
      getHookLabSourcePlatform("https://instagram.example.com/reel/ABC123/"),
    ).toBeNull();
  });
});
