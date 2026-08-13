import { describe, expect, it } from "vitest";
import { getLazyReelSafeExternalUrl } from "./getLazyReelSafeExternalUrl";

describe("getLazyReelSafeExternalUrl", () => {
  it("accepts HTTPS TikTok and Instagram hosts and their subdomains", () => {
    expect(
      getLazyReelSafeExternalUrl("https://www.tiktok.com/@creator/video/1"),
    ).toBe("https://www.tiktok.com/@creator/video/1");
    expect(
      getLazyReelSafeExternalUrl("https://vm.tiktok.com/abc123"),
    ).toBe("https://vm.tiktok.com/abc123");
    expect(
      getLazyReelSafeExternalUrl("https://www.instagram.com/reel/example"),
    ).toBe("https://www.instagram.com/reel/example");
  });

  it("rejects HTTP, unsupported hosts, deceptive suffixes, and invalid URLs", () => {
    expect(getLazyReelSafeExternalUrl("http://www.tiktok.com/video/1")).toBeNull();
    expect(getLazyReelSafeExternalUrl("https://youtube.com/watch?v=1")).toBeNull();
    expect(getLazyReelSafeExternalUrl("https://tiktok.com.attacker.example/1")).toBeNull();
    expect(getLazyReelSafeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(getLazyReelSafeExternalUrl("not a url")).toBeNull();
  });
});
