import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/swapr/photos/expand/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn() };
  const replicate = {
    predictions: { create: vi.fn() },
    wait: vi.fn(),
  };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createReplicateClient: vi.fn(() => replicate),
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
      consumeSwaprPhotoExpand: "rateLimits.consumeSwaprPhotoExpand",
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

function createRequest(overrides: Record<string, string | Blob> = {}) {
  const formData = new FormData();

  formData.set("image", new File(["image"], "image.jpg", {
    type: "image/jpeg",
  }));
  formData.set("mask", new File(["mask"], "mask.png", { type: "image/png" }));
  formData.set("prompt", "extend the studio");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return new Request("https://clipstitchr.test/api/swapr/photos/expand", {
    body: formData,
    method: "POST",
  });
}

describe("POST /api/swapr/photos/expand", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.replicate.predictions.create.mockResolvedValue({
      id: "prediction_1",
      status: "starting",
    });
    mocks.replicate.wait.mockResolvedValue({
      output: ["https://replicate.example/output.jpg"],
      status: "succeeded",
    });
    mocks.getReplicateOutputUrl.mockReturnValue(
      "https://replicate.example/output.jpg",
    );
    mocks.fetchReplicateOutput.mockResolvedValue(
      new Response("expanded", {
        headers: { "content-type": "image/jpeg" },
      }),
    );
  });

  it("returns 401 before token creation when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest());

    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("expands a Swapr photo after quota is consumed", async () => {
    const response = await POST(createRequest());

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("expanded");
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeSwaprPhotoExpand,
      { secret: "rate-limit-secret" },
    );
    expect(mocks.replicate.predictions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "black-forest-labs/flux-fill-pro",
        input: expect.objectContaining({
          output_format: "jpg",
          prompt: "extend the studio",
        }),
      }),
    );
    expect(mocks.fetchReplicateOutput).toHaveBeenCalledWith(
      "https://replicate.example/output.jpg",
    );
  });

  it("returns provider failures and rate-limit responses", async () => {
    mocks.replicate.wait.mockResolvedValueOnce({
      error: "provider failed",
      status: "failed",
    });

    const failedResponse = await POST(createRequest());

    await expect(failedResponse.json()).resolves.toEqual({
      message: "provider failed",
    });
    expect(failedResponse.status).toBe(500);

    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "swaprPhotoExpand",
        retryAfter: 1200,
      },
    });

    const rateLimitResponse = await POST(createRequest());

    expect(rateLimitResponse.status).toBe(429);
  });
});
