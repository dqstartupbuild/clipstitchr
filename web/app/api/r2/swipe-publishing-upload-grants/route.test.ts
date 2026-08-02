import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/r2/swipe-publishing-upload-grants/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    convex,
    createRevision: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    getBackgroundIdentity: vi.fn(),
    getR2UploadSignedUrl: vi.fn(),
    readRequest: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeSwipePublishingPrepare: "consumeSwipePublishingPrepare",
    },
    swipePublishingBundles: {
      getPreparation: { get: "getPreparation" },
      reserve: { reserve: "reserve" },
    },
  },
}));
vi.mock(
  "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient",
  () => ({ createAuthenticatedConvexHttpClient: () => mocks.convex }),
);
vi.mock("@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken", () => ({
  getAuthenticatedConvexToken: mocks.getAuthenticatedConvexToken,
}));
vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));
vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-secret",
}));
vi.mock("@/lib/clipstitchr/server/r2/createR2Client", () => ({
  createR2Client: () => ({ send: vi.fn() }),
}));
vi.mock("@/lib/clipstitchr/server/r2/getR2Environment", () => ({
  getR2Environment: () => ({ bucketName: "bucket" }),
}));
vi.mock("@/lib/clipstitchr/server/r2/getR2SignedUrlExpiresSeconds", () => ({
  getR2SignedUrlExpiresSeconds: () => 300,
}));
vi.mock("@/lib/clipstitchr/server/r2/getR2UploadSignedUrl", () => ({
  getR2UploadSignedUrl: mocks.getR2UploadSignedUrl,
}));
vi.mock(
  "@/lib/clipstitchr/server/r2/readSwipePublishingPreparationRequest",
  () => ({ readSwipePublishingPreparationRequest: mocks.readRequest }),
);
vi.mock(
  "@/lib/clipstitchr/publishing/media/createSwipePublishingRevision",
  () => ({ createSwipePublishingRevision: mocks.createRevision }),
);
vi.mock(
  "@/lib/clipstitchr/publishing/media/server/getSwipePublishingBackgroundIdentity",
  () => ({ getSwipePublishingBackgroundIdentity: mocks.getBackgroundIdentity }),
);

function createRequest() {
  return new Request(
    "https://clipstitchr.test/api/r2/swipe-publishing-upload-grants",
    { method: "POST" },
  );
}

describe("POST /api/r2/swipe-publishing-upload-grants", () => {
  const revision = "a".repeat(64);
  const checksumSha256 = `${"A".repeat(43)}=`;

  function createExistingBundle() {
    return {
      backgrounds: [
        {
          contentType: "image/jpeg",
          id: "background_1",
          objectKey:
            "users/user_123/swipr-backgrounds/background_1/image.jpg",
          sizeBytes: 100,
          version: 'etag:"background"',
        },
      ],
      createdAt: "2026-08-02T00:00:00.000Z",
      editableStateDigest: "b".repeat(64),
      rendererVersion: "swipr-canvas-1080x1920-jpeg-q92-v1",
      revision,
      slides: Array.from({ length: 3 }, (_, index) => ({
        checksumSha256,
        height: 1920,
        index,
        object: {
          contentType: "image/jpeg",
          key: `users/user_123/swipes/swipe_123/publishing/${revision}/slide-${String(index + 1).padStart(2, "0")}-${"A".repeat(43)}.jpg`,
          size: 1_000 + index,
        },
        width: 1080,
      })),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.query.mockResolvedValue({
      backgrounds: [
        {
          id: "background_1",
          imageObject: {
            contentType: "image/jpeg",
            key: "users/user_123/swipr-backgrounds/background_1/image.jpg",
            size: 100,
          },
        },
      ],
      editableStateDigest: "b".repeat(64),
      existingBundle: undefined,
      slideCount: 3,
      swipeId: "swipe_123",
    });
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.getBackgroundIdentity.mockResolvedValue({
      contentType: "image/jpeg",
      id: "background_1",
      objectKey: "users/user_123/swipr-backgrounds/background_1/image.jpg",
      sizeBytes: 100,
      version: 'etag:"background"',
    });
    mocks.createRevision.mockResolvedValue(revision);
    mocks.getR2UploadSignedUrl.mockResolvedValue({
      expiresIn: 300,
      url: "https://r2.example/upload",
    });
  });

  it("validates current ownership/revision and reserves quota before every signer", async () => {
    mocks.readRequest.mockResolvedValue({
      revision,
      slides: Array.from({ length: 3 }, (_, index) => ({
        checksumSha256,
        index,
        sizeBytes: 1_000 + index,
      })),
      swipeId: "swipe_123",
    });

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        grants: expect.arrayContaining([
          expect.objectContaining({
            key: expect.stringContaining(
              `/slide-01-${"A".repeat(43)}.jpg`,
            ),
            size: 1_000,
          }),
        ]),
        revision,
        status: "upload",
      }),
    );
    expect(mocks.convex.query).toHaveBeenCalledWith(
      api.swipePublishingBundles.getPreparation.get,
      { swipeId: "swipe_123" },
    );
    expect(mocks.convex.mutation).toHaveBeenNthCalledWith(
      1,
      api.rateLimits.consumeSwipePublishingPrepare,
      { secret: "rate-secret" },
    );
    expect(mocks.convex.mutation).toHaveBeenNthCalledWith(
      2,
      api.swipePublishingBundles.reserve.reserve,
      expect.objectContaining({ secret: "rate-secret", swipeId: "swipe_123" }),
    );
    expect(mocks.getR2UploadSignedUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        checksumSha256,
        contentLength: 1_000,
        contentType: "image/jpeg",
        preventOverwrite: true,
      }),
    );
    expect(mocks.convex.mutation.mock.invocationCallOrder[1]).toBeLessThan(
      Math.min(...mocks.getR2UploadSignedUrl.mock.invocationCallOrder),
    );
  });

  it("rejects a stale revision before reservation or signing", async () => {
    mocks.readRequest.mockResolvedValue({
      revision: "c".repeat(64),
      slides: Array.from({ length: 3 }, (_, index) => ({
        checksumSha256,
        index,
        sizeBytes: 1_000,
      })),
      swipeId: "swipe_123",
    });

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      error: "Swipe publishing render inputs changed.",
    });
    expect(response.status).toBe(400);
    expect(mocks.convex.mutation).toHaveBeenCalledTimes(1);
    expect(mocks.getR2UploadSignedUrl).not.toHaveBeenCalled();
  });

  it("reuses only after independently deriving the saved bundle revision", async () => {
    const existingBundle = createExistingBundle();
    mocks.convex.query.mockResolvedValueOnce({
      backgrounds: [
        {
          id: "background_1",
          imageObject: {
            contentType: "image/jpeg",
            key: "users/user_123/swipr-backgrounds/background_1/image.jpg",
            size: 100,
          },
        },
      ],
      editableStateDigest: "b".repeat(64),
      existingBundle,
      slideCount: 3,
      swipeId: "swipe_123",
    });
    mocks.readRequest.mockResolvedValue({ swipeId: "swipe_123" });
    mocks.createRevision.mockResolvedValue(revision);

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      bundle: existingBundle,
      status: "reusable",
    });
    expect(mocks.createRevision).toHaveBeenCalledTimes(2);
    expect(mocks.getR2UploadSignedUrl).not.toHaveBeenCalled();
  });

  it("does not trust a bundle that only claims the current revision", async () => {
    mocks.convex.query.mockResolvedValueOnce({
      backgrounds: [
        {
          id: "background_1",
          imageObject: {
            contentType: "image/jpeg",
            key: "users/user_123/swipr-backgrounds/background_1/image.jpg",
            size: 100,
          },
        },
      ],
      editableStateDigest: "b".repeat(64),
      existingBundle: createExistingBundle(),
      slideCount: 3,
      swipeId: "swipe_123",
    });
    mocks.readRequest.mockResolvedValue({ swipeId: "swipe_123" });
    mocks.createRevision
      .mockResolvedValueOnce(revision)
      .mockResolvedValueOnce("c".repeat(64));

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      revision,
      status: "render_required",
    });
    expect(mocks.getR2UploadSignedUrl).not.toHaveBeenCalled();
  });
});
