import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/convex/_generated/api";
import { POST } from "./route";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn(), query: vi.fn() };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createId: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    waitForProviderJob: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    products: { get: "products.get" },
    providerJobs: { create: "providerJobs.create" },
    rateLimits: { consumeCliprHookScript: "rateLimits.consumeCliprHookScript" },
    swiprBackgrounds: {
      listByLibraryQueryKeys: "swiprBackgrounds.listByLibraryQueryKeys",
    },
    usage: {
      cancelUsageReservation: {
        cancelUsageReservation: "usage.cancelUsageReservation",
      },
      reserveCreationCreditBatch: {
        reserveCreationCreditBatch: "usage.reserveCreationCreditBatch",
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
vi.mock("@/lib/clipstitchr/server/getCliprHookModelId", () => ({
  getCliprHookModelId: () => "text-model",
}));
vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));
vi.mock("@/lib/clipstitchr/server/waitForProviderJob", () => ({
  waitForProviderJob: mocks.waitForProviderJob,
}));
vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

function createRequest(overrides: Record<string, unknown> = {}) {
  return new Request("https://clipstitchr.test/api/swipr/drafts/generate", {
    body: JSON.stringify({
      callToActionStyle: "engagement",
      creativeContext: "Focus on launch-day anxiety.",
      productId: "product_1",
      selectedLibraryQueries: ["desk setup"],
      ...overrides,
    }),
    method: "POST",
  });
}

function createProductDocument() {
  return {
    audienceDetails: "Founders",
    createdAt: "2026-01-01T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: ["launches take too long"],
    inferredProblem: "launch work feels scattered",
    name: "Launch Kit",
    productDetails: "AI launch planner",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function createBackground() {
  return {
    id: "background_1",
    libraryQuery: "desk setup",
    source: "pexels",
  };
}

describe("POST /api/swipr/drafts/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.createId.mockReturnValue("batch_1");
    mocks.convex.query.mockImplementation((queryId: string) =>
      queryId === "products.get"
        ? Promise.resolve(createProductDocument())
        : Promise.resolve([createBackground()]),
    );
    mocks.convex.mutation.mockImplementation(async (mutationId: string) => {
      if (mutationId === "usage.reserveCreationCreditBatch") {
        return Array.from({ length: 10 }, (_, index) => ({
          planKey: "agency",
          reservationId: `reservation_${index + 1}`,
        }));
      }

      return null;
    });
    mocks.waitForProviderJob.mockResolvedValue({
      outputAssetIds: ["swipe_1", "swipe_2"],
      providerJobIds: ["prediction_1"],
    });
  });

  it("returns 401 before token creation when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest());

    expect(response.status).toBe(401);
  });

  it("reserves a partial-safe batch and returns durable worker outputs", async () => {
    const response = await POST(createRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      count: 2,
      ids: ["swipe_1", "swipe_2"],
      providerModel: "text-model",
      providerPredictionId: "prediction_1",
    });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.providerJobs.create,
      expect.objectContaining({
        jobType: "manual-swipr-draft",
        usageReservationIds: Array.from(
          { length: 10 },
          (_, index) => `reservation_${index + 1}`,
        ),
      }),
    );
    expect(mocks.waitForProviderJob).toHaveBeenCalledWith(
      mocks.convex,
      "provider:manual-swipr-draft:batch_1",
    );
  });

  it("requires imported Pexels backgrounds before reserving credits", async () => {
    mocks.convex.query.mockImplementation((queryId: string) =>
      queryId === "products.get"
        ? Promise.resolve(createProductDocument())
        : Promise.resolve([]),
    );

    const response = await POST(createRequest());

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "Import Pexels photos before generating draft Swipes.",
    });
    expect(mocks.waitForProviderJob).not.toHaveBeenCalled();
  });

  it("requires at least one selected Pexels pack", async () => {
    const response = await POST(createRequest({ selectedLibraryQueries: [] }));

    expect(response.status).toBe(400);
    expect(mocks.convex.query).not.toHaveBeenCalled();
  });
});
