import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/avatars/photos/generate/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
  };

  return {
    capturePostHogServerEvent: vi.fn(),
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createId: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    putR2Object: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    providerJobs: {
      create: "providerJobs.create",
    },
    rateLimits: {
      consumeAvatarPhotoGenerate: "rateLimits.consumeAvatarPhotoGenerate",
    },
  },
}));

vi.mock("@/lib/clipstitchr/server/analytics/capturePostHogServerEvent", () => ({
  capturePostHogServerEvent: mocks.capturePostHogServerEvent,
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

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

vi.mock("@/lib/clipstitchr/server/r2/putR2Object", () => ({
  putR2Object: mocks.putR2Object,
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

function createFormRequest(overrides: Record<string, string | Blob> = {}) {
  const formData = new FormData();

  formData.set("avatarDescription", "A confident founder in her 30s");
  formData.set("avatarId", "avatar_1");
  formData.set("avatarName", "Founder");
  formData.set("context", "holding a product");
  formData.set("count", "5");
  formData.set("generationSpeedTier", "pro");
  formData.set("identityMode", "same");
  formData.set("image", new File(["avatar"], "avatar.jpg", {
    type: "image/jpeg",
  }));
  formData.set("lighting", "studio");
  formData.set("location", "bright office");
  formData.set("style", "editorial");
  formData.set("wardrobeStyle", "female");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return new Request("https://clipstitchr.test/api/avatars/photos/generate", {
    body: formData,
    method: "POST",
  });
}

describe("POST /api/avatars/photos/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.createId.mockReturnValue("source_1");
    mocks.putR2Object.mockResolvedValue({
      contentType: "image/jpeg",
      key: "users/user_123/provider-inputs/source_1/image.jpg",
      size: 6,
    });
    mocks.convex.mutation.mockImplementation(async (mutationId: string) => {
      if (mutationId === "providerJobs.create") {
        return {
          id: "provider:avatar-photo:source_1",
          status: "queued",
        };
      }

      return null;
    });
  });

  it("returns 401 before parsing form data when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createFormRequest());

    await expect(response.json()).resolves.toEqual({
      message: "Authentication required.",
    });
    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("uploads the source image and creates a provider job", async () => {
    const response = await POST(createFormRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        job: {
          id: "provider:avatar-photo:source_1",
          status: "queued",
        },
        queuedCount: 5,
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeAvatarPhotoGenerate,
      {
        count: 5,
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.putR2Object).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: "image/jpeg",
        key: "users/user_123/provider-inputs/source_1/image.jpg",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.providerJobs.create,
      expect.objectContaining({
        id: "provider:avatar-photo:source_1",
        jobType: "avatar-photo-generation",
        ownerId: "user_123",
        secret: "rate-limit-secret",
      }),
    );
    expect(mocks.capturePostHogServerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        distinctId: "user_123",
        event: "avatar_photos_generation_requested",
      }),
    );
  });

  it("returns a 500 response when avatar description is missing", async () => {
    const response = await POST(
      createFormRequest({ avatarDescription: "   " }),
    );

    await expect(response.json()).resolves.toEqual({
      message: "Add an avatar description before creating photos.",
    });
    expect(response.status).toBe(500);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("returns 429 when generation quota is exceeded", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "avatarPhotoGenerate",
        retryAfter: 4000,
      },
    });

    const response = await POST(createFormRequest());

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        rateLimit: "avatarPhotoGenerate",
        retryAfterSeconds: 4,
      }),
    );
    expect(response.status).toBe(429);
    expect(mocks.putR2Object).not.toHaveBeenCalled();
  });
});
