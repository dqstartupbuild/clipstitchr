import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/convex/_generated/api";
import { SWIPR_BACKGROUND_GENERATION_METADATA_HEADER_NAME } from "@/lib/clipstitchr/constants/swiprBackgroundGenerationMetadataHeaderName";
import { POST } from "./route";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn() };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createId: vi.fn(),
    createSwiprBackgroundGenerationMetadataText: vi.fn(),
    createSwiprBackgroundGenerationPrompt: vi.fn(),
    createSwiprBackgroundVariation: vi.fn(),
    deleteR2Object: vi.fn(),
    fetch: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    getR2DownloadSignedUrl: vi.fn(),
    waitForProviderJob: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    providerJobs: { create: "providerJobs.create" },
    rateLimits: {
      consumeR2Download: "rateLimits.consumeR2Download",
      consumeSwiprBackgroundGenerate:
        "rateLimits.consumeSwiprBackgroundGenerate",
    },
    usage: {
      cancelUsageReservation: {
        cancelUsageReservation: "usage.cancelUsageReservation",
      },
      reserveCreationCredits: {
        reserveCreationCredits: "usage.reserveCreationCredits",
      },
    },
  },
}));

vi.mock(
  "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient",
  () => ({
    createAuthenticatedConvexHttpClient:
      mocks.createAuthenticatedConvexHttpClient,
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
vi.mock("@/lib/clipstitchr/server/r2/deleteR2Object", () => ({
  deleteR2Object: mocks.deleteR2Object,
}));
vi.mock("@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl", () => ({
  getR2DownloadSignedUrl: mocks.getR2DownloadSignedUrl,
}));
vi.mock("@/lib/clipstitchr/server/waitForProviderJob", () => ({
  waitForProviderJob: mocks.waitForProviderJob,
}));
vi.mock("@/lib/clipstitchr/server/createSwiprBackgroundVariation", () => ({
  createSwiprBackgroundVariation: mocks.createSwiprBackgroundVariation,
}));
vi.mock(
  "@/lib/clipstitchr/server/createSwiprBackgroundGenerationPrompt",
  () => ({
    createSwiprBackgroundGenerationPrompt:
      mocks.createSwiprBackgroundGenerationPrompt,
  }),
);
vi.mock(
  "@/lib/clipstitchr/server/createSwiprBackgroundGenerationMetadataText",
  () => ({
    createSwiprBackgroundGenerationMetadataText:
      mocks.createSwiprBackgroundGenerationMetadataText,
  }),
);
vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

function createRequest() {
  return new Request(
    "https://clipstitchr.test/api/swipr/backgrounds/generate",
    {
      body: JSON.stringify({
        presetId: "studio",
        productContext: "portable launch kit",
        prompt: "brass counter with daylight",
      }),
      method: "POST",
    },
  );
}

describe("POST /api/swipr/backgrounds/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", mocks.fetch);
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.deleteR2Object.mockResolvedValue(undefined);
    mocks.createId.mockReturnValue("background_1");
    mocks.createSwiprBackgroundVariation.mockReturnValue({
      name: "Studio",
      presetId: "studio",
      promptDetails: "clean studio",
      tags: ["studio"],
    });
    mocks.createSwiprBackgroundGenerationPrompt.mockReturnValue(
      "A clean studio background",
    );
    mocks.createSwiprBackgroundGenerationMetadataText.mockReturnValue(
      "Studio metadata",
    );
    mocks.convex.mutation.mockImplementation(async (mutationId: string) => {
      if (mutationId === "usage.reserveCreationCredits") {
        return { planKey: "pro", reservationId: "reservation_1" };
      }

      return null;
    });
    mocks.waitForProviderJob.mockResolvedValue({
      outputAssetIds: ["users/user_123/provider-output/background.jpg"],
      providerJobIds: ["prediction_1"],
    });
    mocks.getR2DownloadSignedUrl.mockResolvedValue({
      url: "https://r2.example/background.jpg",
    });
    mocks.fetch.mockResolvedValue(
      new Response("image-bytes", {
        headers: { "content-type": "image/png" },
      }),
    );
  });

  it("returns 401 before token creation when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest());

    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("queues, waits for, downloads, and removes the generated background", async () => {
    const response = await POST(createRequest());

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("image-bytes");
    expect(
      response.headers.get(SWIPR_BACKGROUND_GENERATION_METADATA_HEADER_NAME),
    ).toBe(encodeURIComponent("Studio metadata"));
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.providerJobs.create,
      expect.objectContaining({
        jobType: "swipr-background-generation",
        usageReservationId: "reservation_1",
      }),
    );
    expect(mocks.waitForProviderJob).toHaveBeenCalledWith(
      mocks.convex,
      "provider:swipr-background:background_1",
    );
    expect(mocks.deleteR2Object).toHaveBeenCalledWith(
      "users/user_123/provider-output/background.jpg",
    );
  });

  it("returns durable provider failures", async () => {
    mocks.waitForProviderJob.mockRejectedValue(new Error("provider failed"));

    const response = await POST(createRequest());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: "provider failed",
    });
  });

  it("returns 429 before queueing when generation is rate-limited", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "swiprBackgroundGenerate",
        retryAfter: 1000,
      },
    });

    const response = await POST(createRequest());

    expect(response.status).toBe(429);
    expect(mocks.waitForProviderJob).not.toHaveBeenCalled();
  });
});
