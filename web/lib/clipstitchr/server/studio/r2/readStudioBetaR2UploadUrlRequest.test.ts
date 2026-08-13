import { describe, expect, it } from "vitest";
import { readStudioBetaR2UploadUrlRequest } from "./readStudioBetaR2UploadUrlRequest";

function createRequest(body: object) {
  return new Request("https://clipstitchr.test/api/studio/r2/upload-url", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("readStudioBetaR2UploadUrlRequest", () => {
  it("accepts a bounded media upload", async () => {
    await expect(
      readStudioBetaR2UploadUrlRequest(
        createRequest({
          contentType: "video/mp4",
          kind: "media-source",
          productId: "product_123",
          recordId: "clip_123",
          sizeBytes: 1024.2,
        }),
      ),
    ).resolves.toEqual({
      contentType: "video/mp4",
      kind: "media-source",
      productId: "product_123",
      recordId: "clip_123",
      sizeBytes: 1025,
    });
  });

  it("rejects executable or browser-active file formats", async () => {
    await expect(
      readStudioBetaR2UploadUrlRequest(
        createRequest({
          contentType: "image/svg+xml",
          kind: "poster",
          productId: "product_123",
          recordId: "poster_123",
          sizeBytes: 1024,
        }),
      ),
    ).rejects.toThrow("not supported");
  });

  it("accepts a bounded OpenType or TrueType caption font", async () => {
    await expect(
      readStudioBetaR2UploadUrlRequest(
        createRequest({
          contentType: "font/ttf",
          kind: "font",
          productId: "product_123",
          recordId: "caption_font_123",
          sizeBytes: 2 * 1024 * 1024,
        }),
      ),
    ).resolves.toMatchObject({
      contentType: "font/ttf",
      kind: "font",
      productId: "product_123",
      recordId: "caption_font_123",
    });

    await expect(
      readStudioBetaR2UploadUrlRequest(
        createRequest({
          contentType: "application/octet-stream",
          kind: "font",
          productId: "product_123",
          recordId: "caption_font_123",
          sizeBytes: 2 * 1024 * 1024,
        }),
      ),
    ).rejects.toThrow("not supported");
  });

  it("rejects traversal in record IDs", async () => {
    await expect(
      readStudioBetaR2UploadUrlRequest(
        createRequest({
          contentType: "application/json",
          kind: "project",
          productId: "product_123",
          recordId: "../another-user",
          sizeBytes: 1024,
        }),
      ),
    ).rejects.toThrow("record ID is invalid");
  });

  it("rejects a project artifact above its cap", async () => {
    await expect(
      readStudioBetaR2UploadUrlRequest(
        createRequest({
          contentType: "application/json",
          kind: "project",
          productId: "product_123",
          recordId: "project_123",
          sizeBytes: 26 * 1024 * 1024,
        }),
      ),
    ).rejects.toThrow("too large");
  });

  it("rejects unknown request fields", async () => {
    await expect(
      readStudioBetaR2UploadUrlRequest(
        createRequest({
          contentType: "video/mp4",
          kind: "media-source",
          productId: "product_123",
          recordId: "clip_123",
          secretOverride: "ignored",
          sizeBytes: 1024,
        }),
      ),
    ).rejects.toThrow("unsupported field");
  });
});
