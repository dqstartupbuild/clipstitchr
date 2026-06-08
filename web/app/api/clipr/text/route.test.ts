import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/clipr/text/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createCliprTextGeneration: vi.fn(),
    createReplicateClient: vi.fn(() => ({ provider: "replicate" })),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    products: {
      get: "products.get",
    },
    rateLimits: {
      consumeCliprHookScript: "rateLimits.consumeCliprHookScript",
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

vi.mock("@/lib/clipstitchr/server/createCliprTextGeneration", () => ({
  createCliprTextGeneration: mocks.createCliprTextGeneration,
}));

vi.mock("@/lib/clipstitchr/server/createReplicateClient", () => ({
  createReplicateClient: mocks.createReplicateClient,
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createRequest(body: object) {
  return new Request("https://clipstitchr.test/api/clipr/text", {
    body: JSON.stringify(body),
    method: "POST",
  });
}

function createProduct() {
  return {
    audienceDetails: "Founders",
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: ["slow launch"],
    inferredProblem: "campaigns take too long",
    name: "Launch Kit",
    productDetails: "AI launch planner",
    updatedAt: "2026-05-20T00:00:00.000Z",
  };
}

describe("POST /api/clipr/text", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.query.mockResolvedValue(createProduct());
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.createCliprTextGeneration.mockResolvedValue({
      filledHook: "Stop wasting launch time",
      overlayText: "Launch faster",
      script: "Full script",
      slides: [{ text: "Slide one" }],
    });
  });

  it("returns 401 before token creation when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest({ productId: "product_1" }));

    await expect(response.json()).resolves.toEqual({
      message: "Authentication required.",
    });
    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("generates Clipr text after consuming hook-script quota", async () => {
    const response = await POST(
      createRequest({
        durationSeconds: 45,
        productId: " product_1 ",
        purpose: "swipr",
        slideCount: 99,
      }),
    );

    await expect(response.json()).resolves.toEqual({
      hook: "Stop wasting launch time",
      overlayText: "Launch faster",
      script: "Full script",
      slides: [{ text: "Slide one" }],
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeCliprHookScript,
      { secret: "rate-limit-secret" },
    );
    expect(mocks.convex.query).toHaveBeenCalledWith(api.products.get, {
      id: "product_1",
    });
    expect(mocks.createCliprTextGeneration).toHaveBeenCalledWith(
      expect.objectContaining({
        durationSeconds: 60,
        product: expect.objectContaining({ name: "Launch Kit" }),
        purpose: "swipr",
        replicate: { provider: "replicate" },
        slideCount: 8,
      }),
    );
  });

  it("defaults unknown purposes and slide counts", async () => {
    await POST(
      createRequest({
        productId: "product_1",
        purpose: "other",
        slideCount: "many",
      }),
    );

    expect(mocks.createCliprTextGeneration).toHaveBeenCalledWith(
      expect.objectContaining({
        purpose: "clipr",
        slideCount: 4,
      }),
    );
  });

  it("returns a 500 response when no product is selected", async () => {
    const response = await POST(createRequest({ productId: "" }));

    await expect(response.json()).resolves.toEqual({
      message: "Choose a saved product first.",
    });
    expect(response.status).toBe(500);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("returns 429 when hook script quota is exceeded", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "cliprHookScript",
        retryAfter: 2500,
      },
    });

    const response = await POST(createRequest({ productId: "product_1" }));

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        rateLimit: "cliprHookScript",
        retryAfterSeconds: 3,
      }),
    );
    expect(response.status).toBe(429);
    expect(mocks.createCliprTextGeneration).not.toHaveBeenCalled();
  });
});
