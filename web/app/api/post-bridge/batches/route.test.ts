import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/post-bridge/batches/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    convex,
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    resolvePostBridgeApiKey: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    providerJobs: { create: "providerJobs.create" },
    rateLimits: { consumePostBridgeBatch: "consumePostBridgeBatch" },
    stitches: { get: "stitches.get" },
    swipes: { get: "swipes.get" },
  },
}));
vi.mock(
  "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient",
  () => ({
    createAuthenticatedConvexHttpClient: () => mocks.convex,
  }),
);
vi.mock("@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken", () => ({
  getAuthenticatedConvexToken: mocks.getAuthenticatedConvexToken,
}));
vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));
vi.mock("@/lib/clipstitchr/server/postBridge/resolvePostBridgeApiKey", () => ({
  resolvePostBridgeApiKey: mocks.resolvePostBridgeApiKey,
}));
vi.mock("@/lib/clipstitchr/server/analytics/capturePostHogServerEvent", () => ({
  capturePostHogServerEvent: vi.fn(),
}));
vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));
vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: () => "batch_123",
}));

function createRequest() {
  return new Request("https://clipstitchr.test/api/post-bridge/batches", {
    body: JSON.stringify({
      items: [
        {
          caption: "First caption",
          hasAudio: false,
          mediaFiles: [
            {
              media: {
                mediaKind: "image",
                mimeType: "image/png",
                name: "first.png",
                sizeBytes: 100,
              },
              sourceObject: {
                contentType: "image/png",
                key: "users/user_123/post-bridge-media/first.png",
                size: 100,
              },
            },
          ],
          sourceId: "swipe_1",
          sourceType: "swipe",
          title: "First",
        },
        {
          caption: "Second caption",
          hasAudio: false,
          mediaFiles: [
            {
              media: {
                mediaKind: "image",
                mimeType: "image/png",
                name: "second.png",
                sizeBytes: 200,
              },
              sourceObject: {
                contentType: "image/png",
                key: "users/user_123/post-bridge-media/second.png",
                size: 200,
              },
            },
          ],
          sourceId: "swipe_2",
          sourceType: "swipe",
          title: "Second",
        },
      ],
      socialAccountIds: [12],
    }),
    method: "POST",
  });
}

describe("POST /api/post-bridge/batches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.resolvePostBridgeApiKey.mockResolvedValue("post-bridge-key");
    mocks.convex.query.mockResolvedValue({ id: "saved-source" });
    mocks.convex.mutation.mockResolvedValue(null);
  });

  it("reserves the whole batch before creating one durable worker job", async () => {
    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      jobId: "provider:post-bridge-batch:batch_123",
    });
    expect(response.status).toBe(202);
    expect(mocks.convex.mutation).toHaveBeenNthCalledWith(
      1,
      api.rateLimits.consumePostBridgeBatch,
      {
        idempotencyKey: "user_123:post-bridge-batch:batch_123",
        itemCount: 2,
        mediaSizeBytes: 300,
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.convex.mutation).toHaveBeenNthCalledWith(
      2,
      api.providerJobs.create,
      expect.objectContaining({
        id: "provider:post-bridge-batch:batch_123",
        jobType: "post-bridge-batch",
        stage: "awaiting-provider",
      }),
    );
  });

  it("rejects an unowned source before reserving quota", async () => {
    mocks.convex.query.mockResolvedValueOnce(null);

    const response = await POST(createRequest());

    expect(response.status).toBe(400);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });
});
