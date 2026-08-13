import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDurableSwipePublishingBundle } from "@/lib/clipstitchr/publishing/media/createDurableSwipePublishingBundle";
import type { SwipePublishingBundle } from "@/lib/clipstitchr/publishing/media/SwipePublishingBundle";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

const mocks = vi.hoisted(() => ({
  commit: vi.fn(),
  render: vi.fn(),
  requestPreparation: vi.fn(),
  upload: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/publishing/media/requestSwipePublishingPreparation",
  () => ({ requestSwipePublishingPreparation: mocks.requestPreparation }),
);
vi.mock(
  "@/lib/clipstitchr/publishing/media/renderSwipePublishingSlideBlobs",
  () => ({ renderSwipePublishingSlideBlobs: mocks.render }),
);
vi.mock(
  "@/lib/clipstitchr/publishing/media/uploadSwipePublishingSlideBlobs",
  () => ({ uploadSwipePublishingSlideBlobs: mocks.upload }),
);
vi.mock(
  "@/lib/clipstitchr/publishing/media/requestSwipePublishingBundleCommit",
  () => ({ requestSwipePublishingBundleCommit: mocks.commit }),
);

const revision = "a".repeat(64);
const bundle: SwipePublishingBundle = {
  backgrounds: [
    {
      contentType: "image/jpeg",
      id: "background_1",
      objectKey: "users/user_123/swipr-backgrounds/background_1/image.jpg",
      sizeBytes: 100,
      version: 'etag:"background"',
    },
  ],
  createdAt: "2026-08-02T00:00:00.000Z",
  editableStateDigest: "b".repeat(64),
  rendererVersion: "swipr-canvas-1080x1920-jpeg-q92-v1",
  revision,
  slides: [],
};

function createSwipe(): SwiprSwipe {
  return {
    backgroundId: "background_1",
    createdAt: "2026-08-02T00:00:00.000Z",
    id: "swipe_123",
    name: "Swipe",
    productContext: "Context",
    productName: "Product",
    productSourceId: "product_1",
    productSourceType: "saved-product",
    slides: [],
    updatedAt: "2026-08-02T00:00:00.000Z",
  };
}

describe("createDurableSwipePublishingBundle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requestPreparation.mockResolvedValue({
      revision,
      status: "render_required",
    });
    mocks.render.mockResolvedValue(
      Array.from(
        { length: 3 },
        (_, index) => new Blob([`slide-${index}`], { type: "image/jpeg" }),
      ),
    );
    mocks.upload.mockResolvedValue({
      attemptId: "attempt_1",
      status: "uploaded",
    });
  });

  it("reuses only after the server rechecks backgrounds and renderer identity", async () => {
    mocks.requestPreparation.mockResolvedValueOnce({
      bundle,
      status: "reusable",
    });
    await expect(
      createDurableSwipePublishingBundle({
        backgroundsById: new Map(),
        getAttempt: vi.fn(),
        loadBackgroundBlob: vi.fn(),
        swipe: createSwipe(),
      }),
    ).resolves.toBe(bundle);
    expect(mocks.render).not.toHaveBeenCalled();
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.commit).not.toHaveBeenCalled();
  });

  it("renders, uploads, and idempotently commits the validated revision", async () => {
    mocks.commit.mockResolvedValue(bundle);

    await expect(
      createDurableSwipePublishingBundle({
        backgroundsById: new Map(),
        getAttempt: vi.fn(),
        loadBackgroundBlob: vi.fn(),
        swipe: createSwipe(),
      }),
    ).resolves.toBe(bundle);
    expect(mocks.commit).toHaveBeenCalledWith({ attemptId: "attempt_1" });
  });

  it("reconciles a commit-then-response network failure without deleting media", async () => {
    mocks.commit.mockRejectedValue(new Error("Network reset"));
    const getAttempt = vi.fn().mockResolvedValue({
      bundle,
      status: "committed",
    });

    await expect(
      createDurableSwipePublishingBundle({
        backgroundsById: new Map(),
        getAttempt,
        loadBackgroundBlob: vi.fn(),
        swipe: createSwipe(),
      }),
    ).resolves.toBe(bundle);
    expect(mocks.commit).toHaveBeenCalledTimes(1);
    expect(getAttempt).toHaveBeenCalledWith({ attemptId: "attempt_1" });
  });

  it("retries a reserved commit once and leaves uncertain objects for deferred GC", async () => {
    mocks.commit.mockRejectedValue(new Error("Unavailable"));
    const getAttempt = vi.fn().mockResolvedValue({
      bundle,
      status: "reserved",
    });

    await expect(
      createDurableSwipePublishingBundle({
        backgroundsById: new Map(),
        getAttempt,
        loadBackgroundBlob: vi.fn(),
        swipe: createSwipe(),
      }),
    ).rejects.toThrow("deferred cleanup");
    expect(mocks.commit).toHaveBeenCalledTimes(2);
    expect(getAttempt).toHaveBeenCalledTimes(2);
  });
});
