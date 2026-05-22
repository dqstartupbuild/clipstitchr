import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { r2DownloadUrlBatchMaxKeys } from "@/lib/clipstitchr/constants/r2DownloadUrlBatchMaxKeys";
import { getR2SignedUrlExpiresSeconds } from "@/lib/clipstitchr/server/r2/getR2SignedUrlExpiresSeconds";
import { readR2DeleteObjectsRequest } from "@/lib/clipstitchr/server/r2/readR2DeleteObjectsRequest";
import { readR2DownloadUrlRequest } from "@/lib/clipstitchr/server/r2/readR2DownloadUrlRequest";
import { readR2DownloadUrlsRequest } from "@/lib/clipstitchr/server/r2/readR2DownloadUrlsRequest";
import { readR2UploadUrlRequest } from "@/lib/clipstitchr/server/r2/readR2UploadUrlRequest";
import { readSwiprBackgroundDownloadUrlRequest } from "@/lib/clipstitchr/server/r2/readSwiprBackgroundDownloadUrlRequest";
import { readSwiprBackgroundUploadUrlRequest } from "@/lib/clipstitchr/server/r2/readSwiprBackgroundUploadUrlRequest";

function jsonRequest(body: unknown) {
  return new Request("https://clipstitchr.test/api/r2", {
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  });
}

describe("R2 request readers", () => {
  const originalExpiresSeconds = process.env.R2_SIGNED_URL_EXPIRES_SECONDS;

  beforeEach(() => {
    delete process.env.R2_SIGNED_URL_EXPIRES_SECONDS;
  });

  afterEach(() => {
    if (originalExpiresSeconds === undefined) {
      delete process.env.R2_SIGNED_URL_EXPIRES_SECONDS;
    } else {
      process.env.R2_SIGNED_URL_EXPIRES_SECONDS = originalExpiresSeconds;
    }
  });

  it("uses default, configured, and fallback R2 signed URL expirations", () => {
    expect(getR2SignedUrlExpiresSeconds()).toBe(900);

    process.env.R2_SIGNED_URL_EXPIRES_SECONDS = "120";
    expect(getR2SignedUrlExpiresSeconds()).toBe(120);

    process.env.R2_SIGNED_URL_EXPIRES_SECONDS = "0";
    expect(getR2SignedUrlExpiresSeconds()).toBe(900);

    process.env.R2_SIGNED_URL_EXPIRES_SECONDS = "not-a-number";
    expect(getR2SignedUrlExpiresSeconds()).toBe(900);
  });

  it("reads upload URL requests and validates required fields", async () => {
    await expect(
      readR2UploadUrlRequest(
        jsonRequest({
          contentType: "video/mp4",
          kind: "video-clip-video",
          recordId: "clip_1",
          sizeBytes: 10.2,
        }),
      ),
    ).resolves.toEqual({
      contentType: "video/mp4",
      kind: "video-clip-video",
      recordId: "clip_1",
      sizeBytes: 11,
    });

    await expect(
      readR2UploadUrlRequest(jsonRequest({ kind: "unsupported" })),
    ).rejects.toThrow("Invalid R2 object kind.");
    await expect(
      readR2UploadUrlRequest(
        jsonRequest({
          contentType: "video/mp4",
          kind: "video-clip-video",
          sizeBytes: 1,
        }),
      ),
    ).rejects.toThrow("Missing R2 record ID.");
    await expect(
      readR2UploadUrlRequest(
        jsonRequest({
          kind: "video-clip-video",
          recordId: "clip_1",
          sizeBytes: 1,
        }),
      ),
    ).rejects.toThrow("Missing R2 content type.");
    await expect(
      readR2UploadUrlRequest(
        jsonRequest({
          contentType: "video/mp4",
          kind: "video-clip-video",
          recordId: "clip_1",
          sizeBytes: 0,
        }),
      ),
    ).rejects.toThrow("Missing R2 upload size.");
  });

  it("reads single download URL requests", async () => {
    await expect(
      readR2DownloadUrlRequest(jsonRequest({ key: "uploads/clip.mp4" })),
    ).resolves.toEqual({ key: "uploads/clip.mp4" });
    await expect(readR2DownloadUrlRequest(jsonRequest({}))).rejects.toThrow(
      "Missing R2 object key.",
    );
  });

  it("reads batched download URL requests with uniqueness and validation", async () => {
    await expect(
      readR2DownloadUrlsRequest(jsonRequest({ keys: ["a", "a", "b"] })),
    ).resolves.toEqual({ keys: ["a", "b"] });

    await expect(readR2DownloadUrlsRequest(jsonRequest(null))).rejects.toThrow(
      "Choose at least one R2 object key.",
    );
    await expect(readR2DownloadUrlsRequest(jsonRequest(1))).rejects.toThrow(
      "Choose at least one R2 object key.",
    );
    await expect(readR2DownloadUrlsRequest(jsonRequest({}))).rejects.toThrow(
      "Choose at least one R2 object key.",
    );
    await expect(
      readR2DownloadUrlsRequest(jsonRequest({ keys: "a" })),
    ).rejects.toThrow("Choose at least one R2 object key.");
    await expect(
      readR2DownloadUrlsRequest(jsonRequest({ keys: [] })),
    ).rejects.toThrow("Choose at least one R2 object key.");
    await expect(
      readR2DownloadUrlsRequest(
        jsonRequest({
          keys: Array.from(
            { length: r2DownloadUrlBatchMaxKeys + 1 },
            (_, index) => `key-${index}`,
          ),
        }),
      ),
    ).rejects.toThrow(
      `Request at most ${r2DownloadUrlBatchMaxKeys} R2 object keys at once.`,
    );
    await expect(
      readR2DownloadUrlsRequest(jsonRequest({ keys: ["a", " "] })),
    ).rejects.toThrow("R2 object keys must be non-empty strings.");
  });

  it("filters delete requests to string keys", async () => {
    await expect(
      readR2DeleteObjectsRequest(jsonRequest({ keys: ["a", "", 1, "b"] })),
    ).resolves.toEqual({ keys: ["a", "b"] });
    await expect(readR2DeleteObjectsRequest(jsonRequest({}))).rejects.toThrow(
      "Missing R2 object keys.",
    );
  });

  it("reads Swipr background upload and download requests", async () => {
    await expect(
      readSwiprBackgroundUploadUrlRequest(
        jsonRequest({
          contentType: "image/jpeg",
          recordId: "background_1",
          sizeBytes: 20.1,
        }),
      ),
    ).resolves.toEqual({
      contentType: "image/jpeg",
      recordId: "background_1",
      sizeBytes: 21,
    });
    await expect(
      readSwiprBackgroundDownloadUrlRequest(jsonRequest({ id: "bg_1" })),
    ).resolves.toEqual({ id: "bg_1" });

    await expect(
      readSwiprBackgroundUploadUrlRequest(
        jsonRequest({ contentType: "image/jpeg", sizeBytes: 1 }),
      ),
    ).rejects.toThrow("Missing Swipr background record ID.");
    await expect(
      readSwiprBackgroundUploadUrlRequest(
        jsonRequest({ recordId: "background_1", sizeBytes: 1 }),
      ),
    ).rejects.toThrow("Missing Swipr background content type.");
    await expect(
      readSwiprBackgroundUploadUrlRequest(
        jsonRequest({
          contentType: "image/jpeg",
          recordId: "background_1",
          sizeBytes: -1,
        }),
      ),
    ).rejects.toThrow("Missing Swipr background upload size.");
    await expect(
      readSwiprBackgroundDownloadUrlRequest(jsonRequest({})),
    ).rejects.toThrow("Missing Swipr background ID.");
  });
});
