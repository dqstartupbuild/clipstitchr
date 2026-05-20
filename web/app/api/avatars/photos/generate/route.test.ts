import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/avatars/photos/generate/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
  };
  const replicate = {
    predictions: {
      create: vi.fn(),
    },
    wait: vi.fn(),
  };

  return {
    capturePostHogServerEvent: vi.fn(),
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createAvatarGenerationVariants: vi.fn(),
    createAvatarPhotoGenerationPrompt: vi.fn(),
    createReplicateClient: vi.fn(() => replicate),
    createReplicateImageDataUrl: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    replicate,
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeAvatarPhotoGenerate: "rateLimits.consumeAvatarPhotoGenerate",
    },
    replicateJobs: {
      recordAvatarPhotoJob: "replicateJobs.recordAvatarPhotoJob",
      updateAvatarPhotoJobStatus: "replicateJobs.updateAvatarPhotoJobStatus",
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

vi.mock("@/lib/clipstitchr/server/createAvatarGenerationVariants", () => ({
  createAvatarGenerationVariants: mocks.createAvatarGenerationVariants,
}));

vi.mock("@/lib/clipstitchr/server/createAvatarPhotoGenerationPrompt", () => ({
  createAvatarPhotoGenerationPrompt: mocks.createAvatarPhotoGenerationPrompt,
}));

vi.mock("@/lib/clipstitchr/server/createReplicateClient", () => ({
  createReplicateClient: mocks.createReplicateClient,
}));

vi.mock("@/lib/clipstitchr/server/createReplicateImageDataUrl", () => ({
  createReplicateImageDataUrl: mocks.createReplicateImageDataUrl,
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createFormRequest(overrides: Record<string, string | Blob> = {}) {
  const formData = new FormData();

  formData.set("avatarDescription", "A confident founder in her 30s");
  formData.set("context", "holding a product");
  formData.set("count", "5");
  formData.set("generationSpeedTier", "pro");
  formData.set("identityMode", "preserve");
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
    mocks.convex.mutation.mockReset();
    mocks.createAvatarGenerationVariants.mockReset();
    mocks.createAvatarPhotoGenerationPrompt.mockReset();
    mocks.createReplicateImageDataUrl.mockReset();
    mocks.replicate.predictions.create.mockReset();
    mocks.replicate.wait.mockReset();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.createAvatarGenerationVariants.mockReturnValue([
      {
        lighting: "studio",
        locationDescription: "bright office",
        outfitDescription: "navy blazer",
        poseDescription: "holding a product",
        style: "realistic",
      },
      {
        lighting: "studio",
        locationDescription: "bright office",
        outfitDescription: "white shirt",
        poseDescription: "pointing at a product",
        style: "realistic",
      },
    ]);
    mocks.createAvatarPhotoGenerationPrompt
      .mockReturnValueOnce("Prompt one")
      .mockReturnValue("Prompt two");
    mocks.replicate.predictions.create
      .mockResolvedValueOnce({
        id: "prediction_1",
        status: "starting",
      })
      .mockResolvedValue({
        id: "prediction_2",
        status: "starting",
      });
    mocks.replicate.wait
      .mockResolvedValueOnce({
        error: null,
        output: ["https://replicate.example/avatar-1.jpg"],
        status: "succeeded",
      })
      .mockResolvedValue({
        error: null,
        output: ["https://replicate.example/avatar-2.jpg"],
        status: "succeeded",
      });
    mocks.createReplicateImageDataUrl
      .mockResolvedValueOnce({
        blob: new Blob(["generated-1"], { type: "image/jpeg" }),
        dataUrl: "data:image/jpeg;base64,one",
        mimeType: "image/jpeg",
      })
      .mockResolvedValue({
        blob: new Blob(["generated-2"], { type: "image/jpeg" }),
        dataUrl: "data:image/jpeg;base64,two",
        mimeType: "image/jpeg",
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

  it("creates avatar photo variants and records Replicate job state", async () => {
    const response = await POST(createFormRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        generationSpeedLabel: "Fast",
        generationSpeedTier: "pro",
        modelId: "openai/gpt-image-2",
        prompts: ["Prompt one", "Prompt two"],
        quality: "medium",
      }),
    );
    expect(body.images).toHaveLength(2);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeAvatarPhotoGenerate,
      {
        count: 5,
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.createAvatarGenerationVariants).toHaveBeenCalledWith(
      expect.objectContaining({
        context: "holding a product",
        count: 5,
        lighting: "studio",
        location: "bright office",
        style: "editorial",
        wardrobeStyle: "female",
      }),
    );
    expect(mocks.replicate.predictions.create).toHaveBeenCalledTimes(2);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.replicateJobs.recordAvatarPhotoJob,
      expect.objectContaining({
        predictionId: "prediction_1",
        secret: "rate-limit-secret",
        status: "starting",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.replicateJobs.updateAvatarPhotoJobStatus,
      expect.objectContaining({
        outputUrl: "https://replicate.example/avatar-1.jpg",
        predictionId: "prediction_1",
        status: "succeeded",
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

  it("records failed predictions and returns the provider error", async () => {
    mocks.createAvatarGenerationVariants.mockReturnValueOnce([
      {
        lighting: "studio",
        locationDescription: "bright office",
        outfitDescription: "navy blazer",
        poseDescription: "holding a product",
        style: "realistic",
      },
    ]);
    mocks.replicate.predictions.create.mockReset();
    mocks.replicate.predictions.create.mockResolvedValueOnce({
      id: "prediction_failed",
      status: "starting",
    });
    mocks.replicate.wait.mockReset();
    mocks.replicate.wait.mockResolvedValueOnce({
      error: "unsafe prompt",
      output: null,
      status: "failed",
    });

    const response = await POST(createFormRequest({ count: "1" }));

    await expect(response.json()).resolves.toEqual({
      message: "unsafe prompt",
    });
    expect(response.status).toBe(500);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.replicateJobs.updateAvatarPhotoJobStatus,
      expect.objectContaining({
        error: "unsafe prompt",
        status: "failed",
      }),
    );
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
    expect(mocks.replicate.predictions.create).not.toHaveBeenCalled();
  });
});
