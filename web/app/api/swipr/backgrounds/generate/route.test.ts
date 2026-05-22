import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/swipr/backgrounds/generate/route";
import { api } from "@/convex/_generated/api";
import { SWIPR_BACKGROUND_GENERATION_METADATA_HEADER_NAME } from "@/lib/clipstitchr/constants/swiprBackgroundGenerationMetadataHeaderName";

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
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createReplicateClient: vi.fn(() => replicate),
    createSwiprBackgroundGenerationInput: vi.fn(),
    createSwiprBackgroundGenerationMetadataText: vi.fn(),
    createSwiprBackgroundGenerationPrompt: vi.fn(),
    createSwiprBackgroundVariation: vi.fn(),
    fetchReplicateOutput: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    getReplicateOutputUrl: vi.fn(),
    replicate,
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeSwiprBackgroundGenerate:
        "rateLimits.consumeSwiprBackgroundGenerate",
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

vi.mock("@/lib/clipstitchr/server/createReplicateClient", () => ({
  createReplicateClient: mocks.createReplicateClient,
}));

vi.mock(
  "@/lib/clipstitchr/server/createSwiprBackgroundGenerationInput",
  () => ({
    createSwiprBackgroundGenerationInput:
      mocks.createSwiprBackgroundGenerationInput,
  }),
);

vi.mock(
  "@/lib/clipstitchr/server/createSwiprBackgroundGenerationMetadataText",
  () => ({
    createSwiprBackgroundGenerationMetadataText:
      mocks.createSwiprBackgroundGenerationMetadataText,
  }),
);

vi.mock(
  "@/lib/clipstitchr/server/createSwiprBackgroundGenerationPrompt",
  () => ({
    createSwiprBackgroundGenerationPrompt:
      mocks.createSwiprBackgroundGenerationPrompt,
  }),
);

vi.mock("@/lib/clipstitchr/server/createSwiprBackgroundVariation", () => ({
  createSwiprBackgroundVariation: mocks.createSwiprBackgroundVariation,
}));

vi.mock("@/lib/clipstitchr/server/fetchReplicateOutput", () => ({
  fetchReplicateOutput: mocks.fetchReplicateOutput,
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("@/lib/clipstitchr/server/getReplicateOutputUrl", () => ({
  getReplicateOutputUrl: mocks.getReplicateOutputUrl,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createRequest(body: object) {
  return new Request(
    "https://clipstitchr.test/api/swipr/backgrounds/generate",
    {
      body: JSON.stringify(body),
      method: "POST",
    },
  );
}

describe("POST /api/swipr/backgrounds/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.createSwiprBackgroundVariation.mockReturnValue({
      name: "Studio",
      presetId: "studio",
      promptDetails: "clean studio",
      tags: ["studio"],
    });
    mocks.createSwiprBackgroundGenerationPrompt.mockReturnValue(
      "A clean studio background",
    );
    mocks.createSwiprBackgroundGenerationInput.mockReturnValue({
      prompt: "A clean studio background",
    });
    mocks.createSwiprBackgroundGenerationMetadataText.mockReturnValue(
      "Studio metadata",
    );
    mocks.replicate.predictions.create.mockResolvedValue({
      id: "prediction_1",
      status: "processing",
    });
    mocks.replicate.wait.mockResolvedValue({
      output: ["https://replicate.example/background.jpg"],
      status: "succeeded",
    });
    mocks.getReplicateOutputUrl.mockReturnValue(
      "https://replicate.example/background.jpg",
    );
    mocks.fetchReplicateOutput.mockResolvedValue(
      new Response("image-bytes", {
        headers: {
          "content-type": "image/png",
        },
      }),
    );
  });

  it("returns 401 before token creation when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest({}));

    await expect(response.json()).resolves.toEqual({
      message: "Authentication required.",
    });
    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("creates a background image and returns generation metadata headers", async () => {
    const response = await POST(
      createRequest({
        prompt: "brass counter with daylight",
        presetId: "studio",
        productContext: "portable launch kit",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("image-bytes");
    expect(response.headers.get("content-type")).toContain("image/png");
    expect(
      response.headers.get(SWIPR_BACKGROUND_GENERATION_METADATA_HEADER_NAME),
    ).toBe(encodeURIComponent("Studio metadata"));
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeSwiprBackgroundGenerate,
      { secret: "rate-limit-secret" },
    );
    expect(mocks.createSwiprBackgroundVariation).toHaveBeenCalledWith({
      preferredPresetId: "studio",
      productContext: "portable launch kit",
    });
    expect(mocks.createSwiprBackgroundGenerationPrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        productContext: "portable launch kit",
        userPrompt: "brass counter with daylight",
      }),
    );
    expect(mocks.createSwiprBackgroundGenerationMetadataText).toHaveBeenCalledWith(
      expect.any(Object),
      "brass counter with daylight",
    );
    expect(mocks.replicate.predictions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          prompt: "A clean studio background",
        },
      }),
    );
    expect(mocks.fetchReplicateOutput).toHaveBeenCalledWith(
      "https://replicate.example/background.jpg",
    );
  });

  it("returns 500 when Replicate does not complete", async () => {
    mocks.replicate.wait.mockResolvedValueOnce({
      error: "provider failed",
      status: "failed",
    });

    const response = await POST(createRequest({}));

    await expect(response.json()).resolves.toEqual({
      message: "provider failed",
    });
    expect(response.status).toBe(500);
    expect(mocks.fetchReplicateOutput).not.toHaveBeenCalled();
  });

  it("returns 429 when background generation quota is exceeded", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "swiprBackgroundGenerate",
        retryAfter: 1000,
      },
    });

    const response = await POST(createRequest({}));

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        rateLimit: "swiprBackgroundGenerate",
        retryAfterSeconds: 1,
      }),
    );
    expect(response.status).toBe(429);
    expect(mocks.replicate.predictions.create).not.toHaveBeenCalled();
  });
});
