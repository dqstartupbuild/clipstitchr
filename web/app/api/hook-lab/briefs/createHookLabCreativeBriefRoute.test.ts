import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/convex/_generated/api";
import { createHookLabCreativeBriefRoute } from "./createHookLabCreativeBriefRoute";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    convex,
    createHookLabCreativeBrief: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    getRelatedHookLibraryTemplates: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    hookLabCreativeBriefs: { create: { create: "briefs.create" } },
    hookLabPosts: { get: { get: "posts.get" } },
    products: { get: "products.get" },
    rateLimits: { consumeHookLabCreativeBrief: "limits.consumeBrief" },
  },
}));

vi.mock(
  "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient",
  () => ({ createAuthenticatedConvexHttpClient: () => mocks.convex }),
);

vi.mock("@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken", () => ({
  getAuthenticatedConvexToken: mocks.getAuthenticatedConvexToken,
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("@/lib/clipstitchr/server/createReplicateClient", () => ({
  createReplicateClient: () => ({ provider: "replicate" }),
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-secret",
}));

vi.mock("@/lib/clipstitchr/server/hookLab/createHookLabCreativeBrief", () => ({
  createHookLabCreativeBrief: mocks.createHookLabCreativeBrief,
}));

vi.mock(
  "@/lib/clipstitchr/server/hookLab/getRelatedHookLibraryTemplates",
  () => ({ getRelatedHookLibraryTemplates: mocks.getRelatedHookLibraryTemplates }),
);

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: () => "brief_1",
}));

function createRequest() {
  return new Request("https://clipstitchr.test/api/hook-lab/briefs", {
    body: JSON.stringify({
      destinationTool: "clipr",
      hookTemplateId: "hook_1",
      productId: "product_1",
      sourcePostId: "post_1",
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

const formatDna = {
  adObviousness: "After the hook",
  confidence: "Structure observed, effect inferred",
  ctaStyle: "Save",
  doNotCopy: ["Creator wording"],
  editRhythm: "Fast",
  firstPayoff: "The result starts to appear",
  firstPayoffAtSeconds: 2,
  hookPattern: "Delayed reveal",
  inferences: ["The delay may hold attention"],
  observedEvidence: ["The result is covered"],
  openingQuestion: "What changed?",
  openingVisual: "Covered result",
  productFirstAppearsAtSeconds: 4,
  productRole: "helper",
  proofDevice: "visible demo",
  replicationFormula: "Hide, explain, reveal",
  retentionDevice: "Delayed reveal",
  signatureDevice: "Covered result",
  soundOffSummary: "Text names the problem",
  storyBeats: ["Problem", "Proof"],
  storyFramework: "Problem and payoff",
  version: "format-dna-v1",
};

describe("createHookLabCreativeBriefRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_1");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("token");
    mocks.convex.mutation.mockResolvedValue({ id: "brief_1" });
    mocks.convex.query
      .mockResolvedValueOnce({
        analysis: { caption: "", formatDna, onScreenText: [], timeline: [] },
        id: "post_1",
        status: "ready",
      })
      .mockResolvedValueOnce({
        audienceDetails: "Busy founders",
        createdAt: "2026-07-21T00:00:00.000Z",
        id: "product_1",
        inferredPainPoints: ["Manual work"],
        name: "Launch Kit",
        productDetails: "A saved launch workflow",
        updatedAt: "2026-07-21T00:00:00.000Z",
      });
    mocks.getRelatedHookLibraryTemplates.mockReturnValue([
      { id: "hook_1", template: "A product-grounded pattern" },
    ]);
    mocks.createHookLabCreativeBrief.mockResolvedValue({
      brief: {
        beatScript: ["Problem", "Proof"],
        callToAction: "See the workflow",
        directionName: "Morning reset",
        footageNeeds: ["Task list"],
        hook: "Your morning disappears here",
        openingVisual: "Task list and coffee",
        productProof: "Show the workflow",
        soundOffOverlay: "Where the morning goes",
      },
      modelId: "model",
      predictionId: "prediction",
    });
  });

  it("consumes quota before reading context or calling the provider", async () => {
    const response = await createHookLabCreativeBriefRoute(createRequest());

    expect(response.status).toBe(200);
    expect(mocks.convex.mutation.mock.calls[0]).toEqual([
      api.rateLimits.consumeHookLabCreativeBrief,
      { secret: "rate-secret" },
    ]);
    expect(mocks.createHookLabCreativeBrief).toHaveBeenCalledWith(
      expect.objectContaining({ destinationTool: "clipr" }),
    );
    expect(mocks.convex.mutation).toHaveBeenLastCalledWith(
      api.hookLabCreativeBriefs.create.create,
      expect.objectContaining({
        formatDnaVersion: "format-dna-v1",
        id: "brief_1",
        productId: "product_1",
        sourcePostIds: ["post_1"],
      }),
    );
  });

  it("returns 401 before quota or provider work", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await createHookLabCreativeBriefRoute(createRequest());

    expect(response.status).toBe(401);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.createHookLabCreativeBrief).not.toHaveBeenCalled();
  });
});
