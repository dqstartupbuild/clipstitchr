import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadSwiprBackgroundBlobToR2 } from "@/lib/clipstitchr/client/r2/uploadSwiprBackgroundBlobToR2";

const mocks = vi.hoisted(() => ({
  createSwiprBackgroundUploadUrl: vi.fn(),
  putBlobToR2: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/client/r2/createSwiprBackgroundUploadUrl",
  () => ({
    createSwiprBackgroundUploadUrl: mocks.createSwiprBackgroundUploadUrl,
  }),
);

vi.mock("@/lib/clipstitchr/client/r2/putBlobToR2", () => ({
  putBlobToR2: mocks.putBlobToR2,
}));

describe("uploadSwiprBackgroundBlobToR2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createSwiprBackgroundUploadUrl.mockResolvedValue({
      contentType: "image/jpeg",
      key: "users/user_123/swipr/backgrounds/background_123/image.jpg",
      size: 12,
      url: "https://upload.example/background",
    });
    mocks.putBlobToR2.mockResolvedValue({
      contentType: "image/jpeg",
      etag: '"etag-1"',
      key: "users/user_123/swipr/backgrounds/background_123/image.jpg",
      size: 12,
      versionId: "version-1",
    });
  });

  it("returns an exact legacy object reference after uploading", async () => {
    await expect(
      uploadSwiprBackgroundBlobToR2({
        blob: new Blob(["test content"], { type: "image/jpeg" }),
        recordId: "background_123",
      }),
    ).resolves.toEqual({
      contentType: "image/jpeg",
      key: "users/user_123/swipr/backgrounds/background_123/image.jpg",
      size: 12,
    });
  });
});
