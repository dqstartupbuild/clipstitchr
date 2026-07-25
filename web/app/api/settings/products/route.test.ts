import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/settings/products/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn() };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createId: vi.fn(),
    createProductEnrichment: vi.fn(),
    createProductProfileInputWithWebsiteDetails: vi.fn(),
    createReplicateClient: vi.fn(() => ({ provider: "replicate" })),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    readProductProfileInput: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    products: {
      create: "products.create",
    },
    rateLimits: {
      consumeProductEnrichment: "rateLimits.consumeProductEnrichment",
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

vi.mock("@/lib/clipstitchr/server/createProductEnrichment", () => ({
  createProductEnrichment: mocks.createProductEnrichment,
}));

vi.mock(
  "@/lib/clipstitchr/server/createProductProfileInputWithWebsiteDetails",
  () => ({
    createProductProfileInputWithWebsiteDetails:
      mocks.createProductProfileInputWithWebsiteDetails,
  }),
);

vi.mock("@/lib/clipstitchr/server/createReplicateClient", () => ({
  createReplicateClient: mocks.createReplicateClient,
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

vi.mock("@/lib/clipstitchr/server/readProductProfileInput", () => ({
  readProductProfileInput: mocks.readProductProfileInput,
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

function createRequest() {
  return new Request("https://clipstitchr.test/api/settings/products", {
    body: JSON.stringify({ name: "Launch Kit" }),
    method: "POST",
  });
}

describe("POST /api/settings/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.createId.mockReturnValue("product_1");
    mocks.readProductProfileInput.mockReturnValue({
      audienceDetails: "Founders",
      name: "Launch Kit",
      productDetails: "AI launch planner",
      websiteUrl: "https://launchkit.example.com/",
    });
    mocks.createProductProfileInputWithWebsiteDetails.mockResolvedValue({
      audienceDetails: "Founders",
      name: "Launch Kit",
      productDetails: "AI launch planner",
      websiteDetails: "Page content",
      websiteUrl: "https://launchkit.example.com/",
    });
    mocks.createProductEnrichment.mockResolvedValue({
      emotionalNarrative: "Founders want to stop feeling behind.",
      inferredPainPoints: ["slow launch"],
      inferredProblem: "campaigns take too long",
    });
  });

  it("returns 401 before token creation when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest());

    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("enriches and stores a new product profile", async () => {
    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.product).toEqual(
      expect.objectContaining({
        id: "product_1",
        emotionalNarrative: "Founders want to stop feeling behind.",
        inferredProblem: "campaigns take too long",
        name: "Launch Kit",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeProductEnrichment,
      { secret: "rate-limit-secret" },
    );
    expect(
      mocks.createProductProfileInputWithWebsiteDetails,
    ).toHaveBeenCalledWith({
      product: expect.objectContaining({
        name: "Launch Kit",
        websiteUrl: "https://launchkit.example.com/",
      }),
      shouldScrapeWebsite: true,
    });
    expect(mocks.createProductEnrichment).toHaveBeenCalledWith({
      product: expect.objectContaining({
        name: "Launch Kit",
        productDetails: "AI launch planner",
        websiteDetails: "Page content",
      }),
      replicate: { provider: "replicate" },
    });
    const productCreateCall = mocks.convex.mutation.mock.calls.find(
      ([mutationName]) => mutationName === api.products.create,
    );

    expect(productCreateCall?.[1]).not.toHaveProperty("websiteDetails");
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.products.create,
      expect.objectContaining({
        emotionalNarrative: "Founders want to stop feeling behind.",
        id: "product_1",
        name: "Launch Kit",
        productDetails: "AI launch planner",
        websiteUrl: "https://launchkit.example.com/",
      }),
    );
  });

  it("prefills blank product details and audience details from enrichment", async () => {
    mocks.readProductProfileInput.mockReturnValueOnce({
      audienceDetails: "",
      name: "Launch Kit",
      productDetails: "",
      websiteUrl: "https://launchkit.example.com/",
    });
    mocks.createProductProfileInputWithWebsiteDetails.mockResolvedValueOnce({
      audienceDetails: "",
      name: "Launch Kit",
      productDetails: "",
      websiteDetails: "Page content",
      websiteUrl: "https://launchkit.example.com/",
    });
    mocks.createProductEnrichment.mockResolvedValueOnce({
      audienceDetails: "Solo founders getting ready to launch.",
      emotionalNarrative: "Founders want launch day to feel calm.",
      inferredPainPoints: ["slow launch"],
      inferredProblem: "campaigns take too long",
      productDetails: "A launch planning workspace for small teams.",
    });

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.product).toEqual(
      expect.objectContaining({
        audienceDetails: "Solo founders getting ready to launch.",
        emotionalNarrative: "Founders want launch day to feel calm.",
        productDetails: "A launch planning workspace for small teams.",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.products.create,
      expect.objectContaining({
        audienceDetails: "Solo founders getting ready to launch.",
        productDetails: "A launch planning workspace for small teams.",
      }),
    );
  });

  it("stores the richer website-backed product truth when import ran", async () => {
    mocks.createProductEnrichment.mockResolvedValueOnce({
      emotionalNarrative: "Founders want launch day to feel calm.",
      inferredPainPoints: ["slow launch"],
      inferredProblem: "campaigns take too long",
      productDetails:
        "Launch Kit gives small teams a launch calendar, approval steps, and a shared campaign checklist.",
    });

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.product.productDetails).toBe(
      "Launch Kit gives small teams a launch calendar, approval steps, and a shared campaign checklist.",
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.products.create,
      expect.objectContaining({
        productDetails:
          "Launch Kit gives small teams a launch calendar, approval steps, and a shared campaign checklist.",
      }),
    );
  });

  it("returns rate-limit and validation errors", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "productEnrichment",
        retryAfter: 2000,
      },
    });

    const rateLimitResponse = await POST(createRequest());

    expect(rateLimitResponse.status).toBe(429);

    mocks.readProductProfileInput.mockImplementationOnce(() => {
      throw new Error("Product name is required.");
    });

    const failedResponse = await POST(createRequest());

    await expect(failedResponse.json()).resolves.toEqual({
      message: "Product name is required.",
    });
    expect(failedResponse.status).toBe(500);
  });
});
