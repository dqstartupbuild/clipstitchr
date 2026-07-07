import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/cli/demo-guides/generate/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    convex,
    createCliDemoGuideGeneration: vi.fn(),
    createConvexHttpClient: vi.fn(() => convex),
    createReplicateClient: vi.fn(() => ({ provider: "replicate" })),
    getCliSessionFromRequest: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    cliProducts: {
      getCliProductDocument: {
        getCliProductDocument: "cliProducts.getCliProductDocument",
      },
    },
    rateLimits: {
      consumeCliDemoGuideGenerate: "rateLimits.consumeCliDemoGuideGenerate",
    },
  },
}));

vi.mock(
  "@/lib/clipstitchr/server/cli/demoGuides/createCliDemoGuideGeneration",
  () => ({
    createCliDemoGuideGeneration: mocks.createCliDemoGuideGeneration,
  }),
);

vi.mock("@/lib/clipstitchr/server/cli/getCliSessionFromRequest", () => ({
  getCliSessionFromRequest: mocks.getCliSessionFromRequest,
}));

vi.mock("@/lib/clipstitchr/server/convex/createConvexHttpClient", () => ({
  createConvexHttpClient: mocks.createConvexHttpClient,
}));

vi.mock("@/lib/clipstitchr/server/createReplicateClient", () => ({
  createReplicateClient: mocks.createReplicateClient,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createRequest(body: object) {
  return new Request("https://clipstitchr.test/api/cli/demo-guides/generate", {
    body: JSON.stringify(body),
    method: "POST",
  });
}

function createBody() {
  return {
    appType: "web",
    availableFlows: [
      { confidence: "medium", name: "Open the product", path: "/" },
      { confidence: "medium", name: "Show the main workspace", path: "/dashboard" },
      { confidence: "low", name: "External", path: "https://example.com" },
    ],
    flowName: "Dashboard",
    flowPath: "/dashboard",
    goal: "Show the upload flow",
    productId: "product_123",
    stepCount: 99,
    targetAudience: "busy founders",
  };
}

function createProduct() {
  return {
    audienceDetails: "Founders",
    createdAt: "2026-07-06T00:00:00.000Z",
    id: "product_123",
    inferredPainPoints: ["slow demo creation"],
    name: "ClipStitchr",
    productDetails: "Turns recordings into short videos.",
    updatedAt: "2026-07-06T00:00:00.000Z",
  };
}

function createGeneration() {
  return {
    guide: {
      appType: "web",
      createdAt: "2026-07-06T00:00:00.000Z",
      goal: "Show the upload flow",
      id: "guide_123",
      productId: "product_123",
      productName: "ClipStitchr",
      source: "ai-assisted",
      steps: [
        { id: "step-1", label: "Open the dashboard" },
        { id: "step-2", label: "Upload the clip" },
        { id: "step-3", label: "Review the result" },
      ],
      title: "Upload walkthrough",
      updatedAt: "2026-07-06T00:00:00.000Z",
      version: 1,
    },
    providerModel: "anthropic/claude-sonnet-4.6",
    providerPredictionId: "prediction_123",
  };
}

describe("POST /api/cli/demo-guides/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCliSessionFromRequest.mockResolvedValue({ ownerId: "owner_123" });
    mocks.convex.query.mockResolvedValue(createProduct());
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.createCliDemoGuideGeneration.mockResolvedValue(createGeneration());
  });

  it("returns 401 when the CLI bearer token is missing", async () => {
    mocks.getCliSessionFromRequest.mockResolvedValue(null);

    const response = await POST(createRequest(createBody()));

    await expect(response.json()).resolves.toEqual({
      message: "Run `clipstitchr login` to connect this machine.",
    });
    expect(response.status).toBe(401);
    expect(mocks.convex.query).not.toHaveBeenCalled();
  });

  it("generates a guide after checking product ownership and quota", async () => {
    const response = await POST(createRequest(createBody()));

    await expect(response.json()).resolves.toEqual(createGeneration());
    expect(response.status).toBe(200);
    expect(mocks.convex.query).toHaveBeenCalledWith(
      api.cliProducts.getCliProductDocument.getCliProductDocument,
      {
        id: "product_123",
        ownerId: "owner_123",
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeCliDemoGuideGenerate,
      {
        ownerId: "owner_123",
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.createCliDemoGuideGeneration).toHaveBeenCalledWith(
      expect.objectContaining({
        product: expect.objectContaining({ name: "ClipStitchr" }),
        request: expect.objectContaining({
          availableFlows: [
            { confidence: "medium", name: "Open the product", path: "/" },
            {
              confidence: "medium",
              name: "Show the main workspace",
              path: "/dashboard",
            },
          ],
          stepCount: 8,
        }),
        replicate: { provider: "replicate" },
      }),
    );
  });

  it("returns 400 before quota when the product is not owned by the session", async () => {
    mocks.convex.query.mockResolvedValue(null);

    const response = await POST(createRequest(createBody()));

    await expect(response.json()).resolves.toEqual({
      message: "Product not found.",
    });
    expect(response.status).toBe(400);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.createCliDemoGuideGeneration).not.toHaveBeenCalled();
  });

  it("returns 429 when guide generation quota is exceeded", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "cliDemoGuideGenerate",
        retryAfter: 2500,
      },
    });

    const response = await POST(createRequest(createBody()));

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        rateLimit: "cliDemoGuideGenerate",
        retryAfterSeconds: 3,
      }),
    );
    expect(response.status).toBe(429);
    expect(mocks.createCliDemoGuideGeneration).not.toHaveBeenCalled();
  });

  it("returns 500 when the provider fails", async () => {
    mocks.createCliDemoGuideGeneration.mockRejectedValueOnce(
      new Error("Provider failed."),
    );

    const response = await POST(createRequest(createBody()));

    await expect(response.json()).resolves.toEqual({
      message: "Provider failed.",
    });
    expect(response.status).toBe(500);
  });

  it("returns 500 when provider output remains invalid after repair", async () => {
    mocks.createCliDemoGuideGeneration.mockRejectedValueOnce(
      new Error("AI guide includes an unsafe step."),
    );

    const response = await POST(createRequest(createBody()));

    await expect(response.json()).resolves.toEqual({
      message: "AI guide includes an unsafe step.",
    });
    expect(response.status).toBe(500);
  });
});
