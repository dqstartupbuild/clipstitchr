import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uploadSocialPublishingMediaFromR2Object } from "@/lib/clipstitchr/server/socialPublishing/uploadSocialPublishingMediaFromR2Object";

const mocks = vi.hoisted(() => ({
  createSocialPublishingUploadUrl: vi.fn(),
  deleteR2Object: vi.fn(),
  getR2DownloadSignedUrl: vi.fn(),
  waitForSocialPublishingMediaAvailability: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/socialPublishing/createSocialPublishingUploadUrl", () => ({
  createSocialPublishingUploadUrl: mocks.createSocialPublishingUploadUrl,
}));

vi.mock("@/lib/clipstitchr/server/r2/deleteR2Object", () => ({
  deleteR2Object: mocks.deleteR2Object,
}));

vi.mock("@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl", () => ({
  getR2DownloadSignedUrl: mocks.getR2DownloadSignedUrl,
}));

vi.mock(
  "@/lib/clipstitchr/server/socialPublishing/waitForSocialPublishingMediaAvailability",
  () => ({
    waitForSocialPublishingMediaAvailability:
      mocks.waitForSocialPublishingMediaAvailability,
  }),
);

describe("uploadSocialPublishingMediaFromR2Object", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createSocialPublishingUploadUrl.mockResolvedValue({
      expiresIn: 300,
      key: "uploads/media-123.mp4",
      publicUrl: "https://cdn.zernio.example/media-123.mp4",
      uploadUrl: "https://zernio.example/upload",
    });
    mocks.getR2DownloadSignedUrl.mockResolvedValue({
      expiresIn: 300,
      url: "https://r2.example/download",
    });
    mocks.deleteR2Object.mockResolvedValue(undefined);
    mocks.waitForSocialPublishingMediaAvailability.mockResolvedValue(undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        const requestUrl = String(url);

        if (requestUrl === "https://r2.example/download") {
          return new Response("video", {
            headers: {
              "Content-Type": "video/mp4",
            },
          });
        }

        if (requestUrl === "https://zernio.example/upload") {
          return new Response(null, { status: 204 });
        }

        return new Response(null, { status: 404 });
      }),
    );
  });

  it("streams an owned R2 object to Zernio and deletes the temporary object", async () => {
    await expect(
      uploadSocialPublishingMediaFromR2Object({
        apiKey: "pb_test_key",
        media: {
          mediaKind: "video",
          mimeType: "video/mp4",
          name: "Launch.mp4",
          sizeBytes: 5,
        },
        sourceObject: {
          contentType: "video/mp4",
          key: "users/user_123/social-publishing-media/stitch_123/media.mp4",
          size: 5,
        },
        userId: "user_123",
      }),
    ).resolves.toEqual({
      mediaId: "https://cdn.zernio.example/media-123.mp4",
      mediaKind: "video",
      mimeType: "video/mp4",
      name: "Launch.mp4",
      sizeBytes: 5,
    });
    expect(mocks.createSocialPublishingUploadUrl).toHaveBeenCalledWith({
      apiKey: "pb_test_key",
      mimeType: "video/mp4",
      name: "Launch.mp4",
      sizeBytes: 5,
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://zernio.example/upload",
      expect.objectContaining({
        duplex: "half",
        headers: {
          "Content-Length": "5",
          "Content-Type": "video/mp4",
        },
        method: "PUT",
        signal: expect.any(AbortSignal),
      }),
    );
    expect(mocks.waitForSocialPublishingMediaAvailability).toHaveBeenCalledWith(
      "https://cdn.zernio.example/media-123.mp4",
    );
    expect(mocks.deleteR2Object).toHaveBeenCalledWith(
      "users/user_123/social-publishing-media/stitch_123/media.mp4",
    );
  });

  it("rejects objects outside the authenticated user scope", async () => {
    await expect(
      uploadSocialPublishingMediaFromR2Object({
        apiKey: "pb_test_key",
        media: {
          mediaKind: "video",
          mimeType: "video/mp4",
          name: "Launch.mp4",
          sizeBytes: 5,
        },
        sourceObject: {
          contentType: "video/mp4",
          key: "users/other_user/social-publishing-media/stitch_123/media.mp4",
          size: 5,
        },
        userId: "user_123",
      }),
    ).rejects.toThrow("R2 object key is outside the authenticated user scope.");
    expect(mocks.createSocialPublishingUploadUrl).not.toHaveBeenCalled();
  });

  it("deletes the temporary R2 object when the Zernio upload fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        if (String(url) === "https://r2.example/download") {
          return new Response("video");
        }

        return new Response(null, { status: 503 });
      }),
    );

    await expect(
      uploadSocialPublishingMediaFromR2Object({
        apiKey: "zernio_test_key",
        media: {
          mediaKind: "video",
          mimeType: "video/mp4",
          name: "Launch.mp4",
          sizeBytes: 5,
        },
        sourceObject: {
          contentType: "video/mp4",
          key: "users/user_123/social-publishing-media/stitch_123/media.mp4",
          size: 5,
        },
        userId: "user_123",
      }),
    ).rejects.toThrow("Zernio media upload failed with status 503");
    expect(mocks.deleteR2Object).toHaveBeenCalledWith(
      "users/user_123/social-publishing-media/stitch_123/media.mp4",
    );
  });
});
