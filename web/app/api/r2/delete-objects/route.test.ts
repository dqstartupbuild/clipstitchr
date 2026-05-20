import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/r2/delete-objects/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn() };

  return {
    assertR2ObjectKeyBelongsToUser: vi.fn(),
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    deleteR2Objects: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    readR2DeleteObjectsRequest: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeR2Delete: "rateLimits.consumeR2Delete",
    },
  },
}));

vi.mock(
  "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient",
  () => ({
    createAuthenticatedConvexHttpClient: mocks.createAuthenticatedConvexHttpClient,
  }),
);

vi.mock("@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken", () => ({
  getAuthenticatedConvexToken: mocks.getAuthenticatedConvexToken,
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser", () => ({
  assertR2ObjectKeyBelongsToUser: mocks.assertR2ObjectKeyBelongsToUser,
}));

vi.mock("@/lib/clipstitchr/server/r2/deleteR2Objects", () => ({
  deleteR2Objects: mocks.deleteR2Objects,
}));

vi.mock("@/lib/clipstitchr/server/r2/readR2DeleteObjectsRequest", () => ({
  readR2DeleteObjectsRequest: mocks.readR2DeleteObjectsRequest,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createRequest() {
  return new Request("https://clipstitchr.test/api/r2/delete-objects", {
    body: JSON.stringify({ keys: [] }),
    method: "POST",
  });
}

describe("POST /api/r2/delete-objects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.readR2DeleteObjectsRequest.mockResolvedValue({
      keys: [
        "users/user_123/video-clips/clip_1.mp4",
        "users/user_123/video-clips/clip_1.jpg",
      ],
    });
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.deleteR2Objects.mockResolvedValue(undefined);
  });

  it("returns 401 before parsing when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest());

    expect(response.status).toBe(401);
    expect(mocks.readR2DeleteObjectsRequest).not.toHaveBeenCalled();
  });

  it("validates ownership, consumes quota, and deletes R2 objects", async () => {
    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({ deleted: 2 });
    expect(response.status).toBe(200);
    expect(mocks.assertR2ObjectKeyBelongsToUser).toHaveBeenCalledTimes(2);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeR2Delete,
      {
        objectCount: 2,
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.deleteR2Objects).toHaveBeenCalledWith([
      "users/user_123/video-clips/clip_1.mp4",
      "users/user_123/video-clips/clip_1.jpg",
    ]);
  });

  it("returns validation and rate-limit responses", async () => {
    mocks.assertR2ObjectKeyBelongsToUser.mockImplementationOnce(() => {
      throw new Error("R2 object key is outside the authenticated user scope.");
    });

    const invalidResponse = await POST(createRequest());

    expect(invalidResponse.status).toBe(400);

    mocks.assertR2ObjectKeyBelongsToUser.mockReset();
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "r2Delete",
        retryAfter: 1000,
      },
    });

    const rateLimitResponse = await POST(createRequest());

    expect(rateLimitResponse.status).toBe(429);
  });
});
