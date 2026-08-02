import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/r2/swipe-publishing-commit/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => ({
  convex: {
    mutation: vi.fn(),
    query: vi.fn(),
  },
  enrich: vi.fn(),
  getAuthenticatedConvexToken: vi.fn(),
  getAuthenticatedUserId: vi.fn(),
  readRequest: vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeSwipePublishingPrepare: "consumeSwipePublishingPrepare",
    },
    swipePublishingBundles: {
      commit: { commit: "commit" },
      getAttempt: { get: "getAttempt" },
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
  getRateLimitApiSecret: () => "server-secret",
}));
vi.mock("@/lib/clipstitchr/server/r2/createR2Client", () => ({
  createR2Client: () => ({ send: vi.fn() }),
}));
vi.mock("@/lib/clipstitchr/server/r2/getR2Environment", () => ({
  getR2Environment: () => ({ bucketName: "bucket" }),
}));
vi.mock(
  "@/lib/clipstitchr/server/r2/readSwipePublishingCommitRequest",
  () => ({ readSwipePublishingCommitRequest: mocks.readRequest }),
);
vi.mock(
  "@/lib/clipstitchr/publishing/media/server/enrichPublishingMediaObjectWithR2Head",
  () => ({ enrichPublishingMediaObjectWithR2Head: mocks.enrich }),
);

const checksumSha256 = `${"A".repeat(43)}=`;
const revision = "a".repeat(64);
const bundle = {
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

function createRequest() {
  return new Request(
    "https://clipstitchr.test/api/r2/swipe-publishing-commit",
    { method: "POST" },
  );
}

describe("POST /api/r2/swipe-publishing-commit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.readRequest.mockResolvedValue({ attemptId: "attempt_1" });
    mocks.convex.query.mockResolvedValue({
      bundle,
      status: "reserved",
      swipeId: "swipe_123",
    });
    mocks.convex.mutation.mockImplementation(async (name) =>
      name === "commit" ? bundle : null,
    );
    mocks.enrich.mockResolvedValue(null);
  });

  it("HEAD-verifies every immutable output before the secret-gated commit", async () => {
    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({ bundle });
    expect(response.status).toBe(200);
    expect(mocks.enrich).toHaveBeenCalledTimes(3);
    expect(mocks.enrich).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        descriptor: { kind: "swipe", recordId: "swipe_123" },
        mediaObject: expect.objectContaining({
          checksum: `sha256:${checksumSha256}`,
          contentType: "image/jpeg",
          objectKey: bundle.slides[0].object.key,
          sizeBytes: 1_000,
        }),
        ownerId: "user_123",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenNthCalledWith(
      1,
      api.rateLimits.consumeSwipePublishingPrepare,
      { secret: "server-secret" },
    );
    expect(mocks.convex.mutation).toHaveBeenNthCalledWith(
      2,
      api.swipePublishingBundles.commit.commit,
      { attemptId: "attempt_1", secret: "server-secret" },
    );
    expect(Math.max(...mocks.enrich.mock.invocationCallOrder)).toBeLessThan(
      mocks.convex.mutation.mock.invocationCallOrder[1],
    );
  });

  it.each([
    "The saved media object could not be found in durable storage.",
    "The durable media byte size no longer matches its saved record.",
    "The durable media checksum no longer matches its saved record.",
  ])("refuses finalization when output verification fails: %s", async (message) => {
    mocks.enrich.mockRejectedValueOnce(new Error(message));

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({ error: message });
    expect(response.status).toBe(400);
    expect(mocks.convex.mutation).toHaveBeenCalledTimes(1);
    expect(mocks.convex.mutation).not.toHaveBeenCalledWith(
      api.swipePublishingBundles.commit.commit,
      expect.anything(),
    );
  });

  it("returns a committed attempt without repeating R2 work", async () => {
    mocks.convex.query.mockResolvedValue({
      bundle,
      status: "committed",
      swipeId: "swipe_123",
    });

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({ bundle });
    expect(mocks.enrich).not.toHaveBeenCalled();
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });
});
