import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadSwipePublishingSlideBlobs } from "@/lib/clipstitchr/publishing/media/uploadSwipePublishingSlideBlobs";

const mocks = vi.hoisted(() => ({
  createChecksum: vi.fn(),
  putBlob: vi.fn(),
  requestPreparation: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/client/r2/putBlobToR2", () => ({
  putBlobToR2: mocks.putBlob,
}));
vi.mock(
  "@/lib/clipstitchr/publishing/media/createSha256Base64ChecksumForBlob",
  () => ({
    createSha256Base64ChecksumForBlob: mocks.createChecksum,
  }),
);
vi.mock(
  "@/lib/clipstitchr/publishing/media/requestSwipePublishingPreparation",
  () => ({ requestSwipePublishingPreparation: mocks.requestPreparation }),
);

function createBlobs() {
  return Array.from(
    { length: 3 },
    (_, index) => new Blob([`slide-${index}`], { type: "image/jpeg" }),
  );
}

describe("uploadSwipePublishingSlideBlobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createChecksum.mockResolvedValue(`${"A".repeat(43)}=`);
    mocks.requestPreparation.mockImplementation(async ({ slides }) => ({
      attemptId: "attempt_1",
      grants: slides.map(
        (slide: { checksumSha256: string; index: number; sizeBytes: number }) => ({
          checksumSha256: slide.checksumSha256,
          contentType: "image/jpeg",
          key: `users/user_123/swipes/swipe_123/publishing/revision/slide-${slide.index}.jpg`,
          size: slide.sizeBytes,
          slideIndex: slide.index,
          url: `https://upload/${slide.index}`,
        }),
      ),
      revision: "a".repeat(64),
      status: "upload",
    }));
    mocks.putBlob.mockImplementation(async ({ contentType, key, size }) => ({
      contentType,
      key,
      size,
    }));
  });

  it("receives every reserved grant before starting any PUT", async () => {
    await expect(
      uploadSwipePublishingSlideBlobs({
        blobs: createBlobs(),
        revision: "a".repeat(64),
        swipeId: "swipe_123",
      }),
    ).resolves.toEqual({ attemptId: "attempt_1", status: "uploaded" });

    expect(mocks.requestPreparation).toHaveBeenCalledTimes(1);
    expect(mocks.putBlob).toHaveBeenCalledTimes(3);
    expect(mocks.requestPreparation.mock.invocationCallOrder[0]).toBeLessThan(
      Math.min(...mocks.putBlob.mock.invocationCallOrder),
    );
    expect(mocks.putBlob).toHaveBeenCalledWith(
      expect.objectContaining({ preventOverwrite: true }),
    );
  });

  it("starts no PUT when the server reservation fails", async () => {
    mocks.requestPreparation.mockRejectedValueOnce(new Error("No grants"));

    await expect(
      uploadSwipePublishingSlideBlobs({
        blobs: createBlobs(),
        revision: "a".repeat(64),
        swipeId: "swipe_123",
      }),
    ).rejects.toThrow("No grants");
    expect(mocks.putBlob).not.toHaveBeenCalled();
  });

  it("waits for all PUTs and leaves immutable failures for deferred GC", async () => {
    mocks.putBlob
      .mockResolvedValueOnce({ contentType: "image/jpeg", key: "one", size: 7 })
      .mockRejectedValueOnce(new Error("PUT failed"))
      .mockResolvedValueOnce({ contentType: "image/jpeg", key: "three", size: 7 });

    await expect(
      uploadSwipePublishingSlideBlobs({
        blobs: createBlobs(),
        revision: "a".repeat(64),
        swipeId: "swipe_123",
      }),
    ).rejects.toThrow("deferred cleanup");
    expect(mocks.putBlob).toHaveBeenCalledTimes(3);
  });

  it("uses a bundle committed by a concurrent creator without another PUT", async () => {
    const bundle = {
      backgrounds: [],
      createdAt: "2026-08-02T00:00:00.000Z",
      editableStateDigest: "b".repeat(64),
      rendererVersion: "renderer-v1",
      revision: "a".repeat(64),
      slides: [],
    };
    mocks.requestPreparation.mockResolvedValueOnce({
      bundle,
      status: "reusable",
    });

    await expect(
      uploadSwipePublishingSlideBlobs({
        blobs: createBlobs(),
        revision: "a".repeat(64),
        swipeId: "swipe_123",
      }),
    ).resolves.toEqual({ bundle, status: "reusable" });
    expect(mocks.putBlob).not.toHaveBeenCalled();
  });
});
