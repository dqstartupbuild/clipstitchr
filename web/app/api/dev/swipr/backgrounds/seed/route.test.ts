import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/dev/swipr/backgrounds/seed/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
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
    createSwiprBackgroundGenerationInput: vi.fn(),
    createSwiprBackgroundSeedPlans: vi.fn(),
    fetchReplicateOutput: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    getR2Environment: vi.fn(),
    getReplicateOutputUrl: vi.fn(),
    putR2Object: vi.fn(),
    readImageDimensionsFromBytes: vi.fn(),
    replicate,
    createReplicateClient: vi.fn(() => replicate),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeR2Upload: "rateLimits.consumeR2Upload",
      consumeSwiprSeedBackgroundGenerateDev:
        "rateLimits.consumeSwiprSeedBackgroundGenerateDev",
    },
    swiprBackgrounds: {
      list: "swiprBackgrounds.list",
      save: "swiprBackgrounds.save",
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

vi.mock("@/lib/clipstitchr/server/createSwiprBackgroundSeedPlans", () => ({
  createSwiprBackgroundSeedPlans: mocks.createSwiprBackgroundSeedPlans,
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

vi.mock("@/lib/clipstitchr/server/r2/getR2Environment", () => ({
  getR2Environment: mocks.getR2Environment,
}));

vi.mock("@/lib/clipstitchr/server/r2/putR2Object", () => ({
  putR2Object: mocks.putR2Object,
}));

vi.mock("@/lib/clipstitchr/server/readImageDimensionsFromBytes", () => ({
  readImageDimensionsFromBytes: mocks.readImageDimensionsFromBytes,
}));

function createRequest(body: object = {}) {
  return new Request(
    "https://clipstitchr.test/api/dev/swipr/backgrounds/seed",
    {
      body: JSON.stringify(body),
      method: "POST",
    },
  );
}

function createSeedPlan(id: string) {
  return {
    description: `${id} description`,
    details: `${id} details`,
    id,
    name: `Seed ${id}`,
    prompt: `${id} prompt`,
    tags: ["seed"],
  };
}

describe("POST /api/dev/swipr/backgrounds/seed", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.query.mockResolvedValue([{ id: "background_existing" }]);
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.createSwiprBackgroundSeedPlans.mockReturnValue([
      createSeedPlan("background_existing"),
      createSeedPlan("background_1"),
      createSeedPlan("background_2"),
    ]);
    mocks.createSwiprBackgroundGenerationInput.mockReturnValue({
      prompt: "seed prompt",
    });
    mocks.replicate.predictions.create.mockResolvedValue({
      id: "prediction_1",
      status: "starting",
    });
    mocks.replicate.wait.mockResolvedValue({
      output: ["https://replicate.example/background.jpg"],
      status: "succeeded",
    });
    mocks.getReplicateOutputUrl.mockReturnValue(
      "https://replicate.example/background.jpg",
    );
    mocks.fetchReplicateOutput.mockImplementation(async () =>
      new Response("seed-image", {
        headers: {
          "content-type": "image/jpeg",
        },
      }),
    );
    mocks.readImageDimensionsFromBytes.mockReturnValue({
      height: 1920,
      width: 1080,
    });
    mocks.putR2Object.mockImplementation(async ({ key }) => ({
      contentType: "image/jpeg",
      key,
      size: 10,
    }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 404 outside development", async () => {
    vi.stubEnv("NODE_ENV", "test");

    const response = await POST(createRequest());

    expect(response.status).toBe(404);
    expect(mocks.getAuthenticatedUserId).not.toHaveBeenCalled();
  });

  it("returns 401 before seeding when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      message: "Authentication required.",
    });
    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("seeds only missing Swipr backgrounds up to the requested batch size", async () => {
    const response = await POST(createRequest({ count: 9 }));

    await expect(response.json()).resolves.toEqual({
      remaining: 0,
      requested: 5,
      saved: 2,
      savedIds: ["background_1", "background_2"],
      skipped: 1,
      total: 3,
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.query).toHaveBeenCalledWith(
      api.swiprBackgrounds.list,
      {},
    );
    expect(mocks.getR2Environment).toHaveBeenCalled();
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeSwiprSeedBackgroundGenerateDev,
      {
        count: 1,
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeR2Upload,
      {
        secret: "rate-limit-secret",
        sizeBytes: 10,
      },
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.swiprBackgrounds.save,
      expect.objectContaining({
        height: 1920,
        id: "background_1",
        mimeType: "image/jpeg",
        name: "Seed background_1",
        source: "seed",
        width: 1080,
      }),
    );
    expect(mocks.replicate.predictions.create).toHaveBeenCalledTimes(2);
  });

  it("returns 500 when a provider seed job fails", async () => {
    mocks.replicate.wait.mockResolvedValueOnce({
      error: "seed failed",
      status: "failed",
    });

    const response = await POST(createRequest({ count: 1 }));

    await expect(response.json()).resolves.toEqual({
      message: "seed failed",
    });
    expect(response.status).toBe(500);
    expect(mocks.putR2Object).not.toHaveBeenCalled();
  });
});
