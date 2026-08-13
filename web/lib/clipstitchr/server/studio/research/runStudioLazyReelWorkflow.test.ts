import { beforeEach, describe, expect, it, vi } from "vitest";
import { runStudioLazyReelWorkflow } from "./runStudioLazyReelWorkflow";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn(), query: vi.fn() };

  return {
    completeKey: "complete-run",
    convex,
    createClient: vi.fn(() => convex),
    execute: vi.fn(),
    groundedDescription: vi.fn(),
    pendingKey: "create-pending",
    productFromDocument: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    products: { get: "get-product" },
    studioLazyReelResearchRuns: {
      complete: { complete: mocks.completeKey },
      createPending: { createPending: mocks.pendingKey },
      fail: { fail: "fail-run" },
    },
  },
}));
vi.mock(
  "@/lib/clipstitchr/backend/createProductProfileFromConvexDocument",
  () => ({ createProductProfileFromConvexDocument: mocks.productFromDocument }),
);
vi.mock(
  "@/lib/clipstitchr/server/studio/lazyreel/executeLazyReelWorkflow",
  () => ({ executeLazyReelWorkflow: mocks.execute }),
);
vi.mock(
  "@/lib/clipstitchr/server/studio/lazyreel/product/createLazyReelGroundedProductDescription",
  () => ({
    createLazyReelGroundedProductDescription: mocks.groundedDescription,
  }),
);
vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: () => "workflow-run-id",
}));
vi.mock("./getStudioLazyReelConvexClient", () => ({
  getStudioLazyReelConvexClient: mocks.createClient,
}));

const result = {
  data: {
    executionStatus: "plan_only" as const,
    manifest: [],
    outputContract: [],
    providerRequirements: [],
    stages: [],
    targetDurationSeconds: 15,
  },
  evidence: [],
  limitations: [],
  links: [],
  methodology: "Plan only.",
  sections: [],
  summary: "Plan complete.",
  title: "Video editor",
  workflow: "video_editor" as const,
};

describe("runStudioLazyReelWorkflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.convex.query.mockResolvedValue({ id: "product-123" });
    mocks.productFromDocument.mockReturnValue({ id: "product-123" });
    mocks.groundedDescription.mockReturnValue("Saved Product facts");
    mocks.execute.mockReturnValue(result);
    mocks.convex.mutation.mockImplementation((operation) => {
      if (operation === mocks.pendingKey) {
        return Promise.resolve({
          created: true,
          run: { id: "workflow-run-id", status: "pending" },
        });
      }

      return Promise.resolve({ id: "workflow-run-id", status: "completed" });
    });
  });

  it("replaces browser Product text and persists an explicit workflow identity", async () => {
    const response = await runStudioLazyReelWorkflow({
      idempotencyKey: "workflow-request-123",
      productId: "product-123",
      request: {
        brief: "Create an edit plan.",
        product: "Browser claim",
        workflow: "video_editor",
      },
    });

    expect(mocks.execute).toHaveBeenCalledWith({
      brief: "Create an edit plan.",
      product: "Saved Product facts",
      workflow: "video_editor",
    });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      mocks.pendingKey,
      expect.objectContaining({
        identity: { kind: "workflow", key: "video_editor" },
        productId: "product-123",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      mocks.completeKey,
      expect.objectContaining({ outcome: "complete" }),
    );
    expect(response).toEqual({
      created: true,
      result,
      runId: "workflow-run-id",
    });
  });
});
