import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uploadPostBridgeMediaFromR2Object } from "@/lib/clipstitchr/server/postBridge/uploadPostBridgeMediaFromR2Object";

const mocks = vi.hoisted(() => ({
  createPostBridgeUploadUrl: vi.fn(),
  deleteR2Object: vi.fn(),
  getR2DownloadSignedUrl: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/postBridge/createPostBridgeUploadUrl", () => ({
  createPostBridgeUploadUrl: mocks.createPostBridgeUploadUrl,
}));

vi.mock("@/lib/clipstitchr/server/r2/deleteR2Object", () => ({
  deleteR2Object: mocks.deleteR2Object,
}));

vi.mock("@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl", () => ({
  getR2DownloadSignedUrl: mocks.getR2DownloadSignedUrl,
}));

describe("uploadPostBridgeMediaFromR2Object", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createPostBridgeUploadUrl.mockResolvedValue({
      media_id: "media_123",
      name: "Launch.mp4",
      upload_url: "https://post-bridge.example/upload",
    });
    mocks.getR2DownloadSignedUrl.mockResolvedValue({
      expiresIn: 300,
      url: "https://r2.example/download",
    });
    mocks.deleteR2Object.mockResolvedValue(undefined);
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

        if (requestUrl === "https://post-bridge.example/upload") {
          return new Response(null, { status: 204 });
        }

        return new Response(null, { status: 404 });
      }),
    );
  });

  it("streams an owned R2 object to Post Bridge and deletes the temporary object", async () => {
    await expect(
      uploadPostBridgeMediaFromR2Object({
        apiKey: "pb_test_key",
        media: {
          mediaKind: "video",
          mimeType: "video/mp4",
          name: "Launch.mp4",
          sizeBytes: 5,
        },
        sourceObject: {
          contentType: "video/mp4",
          key: "users/user_123/post-bridge-media/stitch_123/media.mp4",
          size: 5,
        },
        userId: "user_123",
      }),
    ).resolves.toEqual({
      mediaId: "media_123",
      mediaKind: "video",
      mimeType: "video/mp4",
      name: "Launch.mp4",
      sizeBytes: 5,
    });
    expect(mocks.createPostBridgeUploadUrl).toHaveBeenCalledWith({
      apiKey: "pb_test_key",
      mimeType: "video/mp4",
      name: "Launch.mp4",
      sizeBytes: 5,
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://post-bridge.example/upload",
      expect.objectContaining({
        duplex: "half",
        headers: {
          "Content-Length": "5",
          "Content-Type": "video/mp4",
        },
        method: "PUT",
      }),
    );
    expect(mocks.deleteR2Object).toHaveBeenCalledWith(
      "users/user_123/post-bridge-media/stitch_123/media.mp4",
    );
  });

  it("rejects objects outside the authenticated user scope", async () => {
    await expect(
      uploadPostBridgeMediaFromR2Object({
        apiKey: "pb_test_key",
        media: {
          mediaKind: "video",
          mimeType: "video/mp4",
          name: "Launch.mp4",
          sizeBytes: 5,
        },
        sourceObject: {
          contentType: "video/mp4",
          key: "users/other_user/post-bridge-media/stitch_123/media.mp4",
          size: 5,
        },
        userId: "user_123",
      }),
    ).rejects.toThrow("R2 object key is outside the authenticated user scope.");
    expect(mocks.createPostBridgeUploadUrl).not.toHaveBeenCalled();
  });
});
