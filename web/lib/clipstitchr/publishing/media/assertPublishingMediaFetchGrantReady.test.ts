import { describe, expect, it } from "vitest";
import { assertPublishingMediaFetchGrantReady } from "@/lib/clipstitchr/publishing/media/assertPublishingMediaFetchGrantReady";
import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";

const nowEpochMs = Date.UTC(2026, 7, 2, 12, 0, 0);
const verifiedOrigin = "https://media.clipstitchr.com";
const readyGrant = {
  expiresAtEpochMs: nowEpochMs + 75 * 60 * 1000,
  supportsNoRedirectFetch: true,
  supportsGet: true,
  supportsHead: true,
  supportsRange: true,
  url: "https://media.clipstitchr.com/video.mp4?X-Amz-Signature=secret",
};

describe("assertPublishingMediaFetchGrantReady", () => {
  it("accepts a fresh public HTTPS grant with TikTok fetch capabilities", () => {
    expect(
      assertPublishingMediaFetchGrantReady(
        readyGrant,
        "tiktok",
        nowEpochMs,
        verifiedOrigin,
      ),
    ).toEqual(readyGrant);
  });

  it("rejects expired and soon-expiring transient URLs", () => {
    for (const expiresAtEpochMs of [
      nowEpochMs - 1,
      nowEpochMs + 2 * 60 * 1000,
    ]) {
      expect(() =>
        assertPublishingMediaFetchGrantReady(
          { ...readyGrant, expiresAtEpochMs },
          "instagram",
          nowEpochMs,
        ),
      ).toThrowError(
        expect.objectContaining<Partial<PublishingMediaValidationError>>({
          code: "fetch_url_not_ready",
        }),
      );
    }
  });

  it.each([
    "blob:https://clipstitchr.com/local-video",
    "http://media.clipstitchr.com/video.mp4",
    "https://127.0.0.1/video.mp4",
    "https://192.168.1.8/video.mp4",
    "https://[::1]/video.mp4",
  ])("rejects a non-provider-readable URL: %s", (url) => {
    expect(() =>
      assertPublishingMediaFetchGrantReady(
        { ...readyGrant, url },
        "instagram",
        nowEpochMs,
        verifiedOrigin,
      ),
    ).toThrow("public HTTPS URL");
  });

  it("requires HEAD and range reads for TikTok", () => {
    expect(() =>
      assertPublishingMediaFetchGrantReady(
        { ...readyGrant, supportsHead: false },
        "tiktok",
        nowEpochMs,
        verifiedOrigin,
      ),
    ).toThrow("HEAD requests");
    expect(() =>
      assertPublishingMediaFetchGrantReady(
        { ...readyGrant, supportsRange: false },
        "tiktok",
        nowEpochMs,
        verifiedOrigin,
      ),
    ).toThrow("byte-range reads");
  });

  it("requires a no-redirect URL on a verified ClipStitchr-owned domain for TikTok", () => {
    expect(() =>
      assertPublishingMediaFetchGrantReady(
        {
          ...readyGrant,
          url: "https://example.r2.cloudflarestorage.com/video.mp4",
        },
        "tiktok",
        nowEpochMs,
        verifiedOrigin,
      ),
    ).toThrow("verified ClipStitchr-owned HTTPS domain");
    expect(() =>
      assertPublishingMediaFetchGrantReady(
        { ...readyGrant, supportsNoRedirectFetch: false },
        "tiktok",
        nowEpochMs,
        verifiedOrigin,
      ),
    ).toThrow("without redirects");
  });

  it("requires more than the provider's one-hour TikTok pull window", () => {
    expect(() =>
      assertPublishingMediaFetchGrantReady(
        {
          ...readyGrant,
          expiresAtEpochMs: nowEpochMs + 60 * 60 * 1000,
        },
        "tiktok",
        nowEpochMs,
        verifiedOrigin,
      ),
    ).toThrow("expires too soon");
  });

  it("fails closed when no verified ClipStitchr origin is configured", () => {
    expect(() =>
      assertPublishingMediaFetchGrantReady(readyGrant, "tiktok", nowEpochMs),
    ).toThrow("verified ClipStitchr-owned HTTPS domain");
  });
});
