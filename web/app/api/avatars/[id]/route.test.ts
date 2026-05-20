import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE } from "@/app/api/avatars/[id]/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    assertR2ObjectKeyBelongsToUser: vi.fn(),
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    deleteR2Objects: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    avatars: {
      getDeleteBundle: "avatars.getDeleteBundle",
      removeWithPhotos: "avatars.removeWithPhotos",
    },
    rateLimits: {
      consumeAvatarCascadeDelete: "rateLimits.consumeAvatarCascadeDelete",
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

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createContext(id = " avatar_1 ") {
  return {
    params: Promise.resolve({ id }),
  };
}

function createBundle() {
  return {
    photos: [
      {
        id: "photo_1",
        originalObject: {
          contentType: "image/png",
          key: "users/user_123/photos/photo_1/original.png",
          size: 20,
        },
        photoObject: {
          contentType: "image/jpeg",
          key: "users/user_123/photos/photo_1/photo.jpg",
          size: 10,
        },
        thumbnailObject: {
          contentType: "image/jpeg",
          key: "users/user_123/photos/photo_1/photo.jpg",
          size: 10,
        },
      },
      {
        id: "photo_2",
        photoObject: {
          contentType: "image/jpeg",
          key: "users/user_123/photos/photo_2/photo.jpg",
          size: 10,
        },
      },
    ],
  };
}

describe("DELETE /api/avatars/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.query.mockResolvedValue(createBundle());
    mocks.convex.mutation.mockImplementation((mutationId: string) => {
      if (mutationId === "avatars.removeWithPhotos") {
        return Promise.resolve({
          deletedAvatars: 1,
          deletedPhotos: 2,
        });
      }

      return Promise.resolve(null);
    });
    mocks.deleteR2Objects.mockResolvedValue(undefined);
  });

  it("returns 401 before resolving params when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await DELETE(new Request("https://clipstitchr.test"), createContext());

    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("deletes avatar photos, de-dupes R2 object keys, and removes metadata", async () => {
    const response = await DELETE(new Request("https://clipstitchr.test"), createContext());

    await expect(response.json()).resolves.toEqual({
      deletedAvatars: 1,
      deletedObjectCount: 3,
      deletedPhotos: 2,
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.query).toHaveBeenCalledWith(
      api.avatars.getDeleteBundle,
      { id: "avatar_1" },
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeAvatarCascadeDelete,
      { secret: "rate-limit-secret" },
    );
    expect(mocks.assertR2ObjectKeyBelongsToUser).toHaveBeenCalledTimes(3);
    expect(mocks.deleteR2Objects).toHaveBeenCalledWith([
      "users/user_123/photos/photo_1/photo.jpg",
      "users/user_123/photos/photo_1/original.png",
      "users/user_123/photos/photo_2/photo.jpg",
    ]);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.avatars.removeWithPhotos,
      {
        id: "avatar_1",
        photoIds: ["photo_1", "photo_2"],
        secret: "rate-limit-secret",
      },
    );
  });

  it("returns not-found, validation, ownership, and rate-limit failures", async () => {
    mocks.convex.query.mockResolvedValueOnce(null);

    const notFoundResponse = await DELETE(
      new Request("https://clipstitchr.test"),
      createContext(),
    );

    expect(notFoundResponse.status).toBe(404);

    const missingIdResponse = await DELETE(
      new Request("https://clipstitchr.test"),
      createContext(" "),
    );

    await expect(missingIdResponse.json()).resolves.toEqual({
      error: "Missing avatar ID.",
    });
    expect(missingIdResponse.status).toBe(500);

    mocks.assertR2ObjectKeyBelongsToUser.mockImplementationOnce(() => {
      throw new Error("R2 object key is outside the authenticated user scope.");
    });

    const ownershipResponse = await DELETE(
      new Request("https://clipstitchr.test"),
      createContext(),
    );

    expect(ownershipResponse.status).toBe(500);

    mocks.assertR2ObjectKeyBelongsToUser.mockReset();
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "avatarCascadeDelete",
        retryAfter: 1000,
      },
    });

    const rateLimitResponse = await DELETE(
      new Request("https://clipstitchr.test"),
      createContext(),
    );

    expect(rateLimitResponse.status).toBe(429);
  });
});
