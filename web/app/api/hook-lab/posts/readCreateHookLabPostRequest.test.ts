import { describe, expect, it } from "vitest";
import { readCreateHookLabPostRequest } from "./readCreateHookLabPostRequest";

function createRequest(url: unknown) {
  return new Request("https://clipstitchr.com/api/hook-lab/posts", {
    body: JSON.stringify({ url }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

describe("readCreateHookLabPostRequest", () => {
  it("accepts and canonicalizes a TikTok video URL", async () => {
    await expect(
      readCreateHookLabPostRequest(
        createRequest(
          " https://www.tiktok.com/@creator/video/123456789?is_from_webapp=1 ",
        ),
      ),
    ).resolves.toEqual({
      canonicalUrl: "https://www.tiktok.com/@creator/video/123456789",
      platform: "tiktok",
    });
  });

  it("accepts and canonicalizes an Instagram Reel URL", async () => {
    await expect(
      readCreateHookLabPostRequest(
        createRequest("https://www.instagram.com/reel/ABC123/?igsh=test"),
      ),
    ).resolves.toEqual({
      canonicalUrl: "https://www.instagram.com/reel/ABC123/",
      platform: "instagram",
    });
  });

  it("rejects an unsupported URL", async () => {
    await expect(
      readCreateHookLabPostRequest(
        createRequest("https://www.youtube.com/watch?v=123"),
      ),
    ).rejects.toThrow(
      "Use a public TikTok video or Instagram video post link.",
    );
  });
});
