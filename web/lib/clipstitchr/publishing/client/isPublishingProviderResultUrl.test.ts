import { describe, expect, it } from "vitest";
import { isPublishingProviderResultUrl } from "@/lib/clipstitchr/publishing/client/isPublishingProviderResultUrl";

describe("isPublishingProviderResultUrl", () => {
  it("accepts HTTPS links only on the matching public provider host", () => {
    expect(
      isPublishingProviderResultUrl(
        "youtube",
        "https://www.youtube.com/watch?v=video_1",
      ),
    ).toBe(true);
    expect(
      isPublishingProviderResultUrl(
        "instagram",
        "https://www.instagram.com/reel/result_1/",
      ),
    ).toBe(true);
    expect(
      isPublishingProviderResultUrl(
        "tiktok",
        "https://www.tiktok.com/@studio/video/123",
      ),
    ).toBe(true);
    expect(isPublishingProviderResultUrl("youtube", null)).toBe(true);
  });

  it("rejects HTTP, lookalike, credentialed, and cross-provider links", () => {
    expect(
      isPublishingProviderResultUrl(
        "youtube",
        "http://www.youtube.com/watch?v=video_1",
      ),
    ).toBe(false);
    expect(
      isPublishingProviderResultUrl(
        "youtube",
        "https://youtube.com.attacker.invalid/watch?v=video_1",
      ),
    ).toBe(false);
    expect(
      isPublishingProviderResultUrl(
        "instagram",
        "https://user:pass@www.instagram.com/reel/result_1/",
      ),
    ).toBe(false);
    expect(
      isPublishingProviderResultUrl(
        "youtube",
        "https://www.tiktok.com/@studio/video/123",
      ),
    ).toBe(false);
  });
});
