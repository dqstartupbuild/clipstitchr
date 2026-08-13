import { describe, expect, it } from "vitest";
import { readStudioBetaR2DownloadUrlRequest } from "./readStudioBetaR2DownloadUrlRequest";

describe("readStudioBetaR2DownloadUrlRequest", () => {
  it("reads a bounded object key", async () => {
    const request = new Request("https://clipstitchr.test/api/studio/r2/download-url", {
      body: JSON.stringify({
        key: "users/owner/studio/v1/media-output/file.mp4",
        productId: "product_123",
      }),
      method: "POST",
    });

    await expect(readStudioBetaR2DownloadUrlRequest(request)).resolves.toEqual({
      key: "users/owner/studio/v1/media-output/file.mp4",
      productId: "product_123",
    });
  });

  it("rejects a missing object key", async () => {
    const request = new Request("https://clipstitchr.test/api/studio/r2/download-url", {
      body: "{}",
      method: "POST",
    });

    await expect(readStudioBetaR2DownloadUrlRequest(request)).rejects.toThrow(
      "Missing R2 object key.",
    );
  });

  it("rejects unknown request fields", async () => {
    const request = new Request("https://clipstitchr.test/api/studio/r2/download-url", {
      body: JSON.stringify({
        key: "users/owner/studio/v1/media-output/file.mp4",
        productId: "product_123",
        url: "https://example.test/ignored",
      }),
      method: "POST",
    });

    await expect(readStudioBetaR2DownloadUrlRequest(request)).rejects.toThrow(
      "unsupported field",
    );
  });
});
