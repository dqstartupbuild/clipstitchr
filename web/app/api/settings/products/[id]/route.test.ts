import { beforeEach, describe, expect, it, vi } from "vitest";
import { PATCH } from "@/app/api/settings/products/[id]/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
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
      get: "products.get",
      update: "products.update",
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

function createRequest() {
  return new Request("https://clipstitchr.test/api/settings/products/product_1", {
    body: JSON.stringify({ name: "Launch Kit" }),
    method: "PATCH",
  });
}

function createContext(id = " product_1 ") {
  return {
    params: Promise.resolve({ id }),
  };
}

describe("PATCH /api/settings/products/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.query.mockResolvedValue({
      createdAt: "2026-05-20T00:00:00.000Z",
      id: "product_1",
      websiteUrl: "https://old.example.com/",
    });
    mocks.convex.mutation.mockResolvedValue(null);
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

  it("returns 401 before resolving the route params when auth is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await PATCH(createRequest(), createContext());

    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("updates an existing product profile", async () => {
    const response = await PATCH(createRequest(), createContext());
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
    expect(mocks.convex.query).toHaveBeenCalledWith(api.products.get, {
      id: "product_1",
    });
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
    const productUpdateCall = mocks.convex.mutation.mock.calls.find(
      ([mutationName]) => mutationName === api.products.update,
    );

    expect(productUpdateCall?.[1]).not.toHaveProperty("websiteDetails");
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.products.update,
      expect.objectContaining({
        emotionalNarrative: "Founders want to stop feeling behind.",
        id: "product_1",
        inferredPainPoints: ["slow launch"],
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

    const response = await PATCH(createRequest(), createContext());
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
      api.products.update,
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

    const response = await PATCH(createRequest(), createContext());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.product.productDetails).toBe(
      "Launch Kit gives small teams a launch calendar, approval steps, and a shared campaign checklist.",
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.products.update,
      expect.objectContaining({
        productDetails:
          "Launch Kit gives small teams a launch calendar, approval steps, and a shared campaign checklist.",
      }),
    );
  });

  it("does not rescrape an unchanged product website URL", async () => {
    mocks.convex.query.mockResolvedValueOnce({
      createdAt: "2026-05-20T00:00:00.000Z",
      id: "product_1",
      websiteUrl: "https://launchkit.example.com/",
    });

    const response = await PATCH(createRequest(), createContext());

    expect(response.status).toBe(200);
    expect(
      mocks.createProductProfileInputWithWebsiteDetails,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldScrapeWebsite: false,
      }),
    );
  });

  it("returns not-found, missing-id, and rate-limit responses", async () => {
    mocks.convex.query.mockResolvedValueOnce(null);

    const notFoundResponse = await PATCH(createRequest(), createContext());

    expect(notFoundResponse.status).toBe(404);

    const missingIdResponse = await PATCH(createRequest(), createContext(" "));

    await expect(missingIdResponse.json()).resolves.toEqual({
      message: "Missing product ID.",
    });
    expect(missingIdResponse.status).toBe(500);

    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "productEnrichment",
        retryAfter: 2000,
      },
    });

    const rateLimitResponse = await PATCH(createRequest(), createContext());

    expect(rateLimitResponse.status).toBe(429);
  });
});
