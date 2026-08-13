import { beforeEach, describe, expect, it, vi } from "vitest";
import { runStudioLazyReelResearchTool } from "./runStudioLazyReelResearchTool";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn(), query: vi.fn() };

  return {
    completeKey: "complete-run",
    convex,
    createClient: vi.fn(() => convex),
    execute: vi.fn(),
    failKey: "fail-run",
    ground: vi.fn(),
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
      fail: { fail: mocks.failKey },
    },
  },
}));
vi.mock(
  "@/lib/clipstitchr/backend/createProductProfileFromConvexDocument",
  () => ({ createProductProfileFromConvexDocument: mocks.productFromDocument }),
);
vi.mock(
  "@/lib/clipstitchr/server/studio/lazyreel/executeLazyReelResearchTool",
  () => ({ executeLazyReelResearchTool: mocks.execute }),
);
vi.mock(
  "@/lib/clipstitchr/server/studio/lazyreel/product/groundLazyReelToolRequestInProduct",
  () => ({ groundLazyReelToolRequestInProduct: mocks.ground }),
);
vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: () => "new-run-id",
}));
vi.mock("./getStudioLazyReelConvexClient", () => ({
  getStudioLazyReelConvexClient: mocks.createClient,
}));

const result = {
  data: {},
  evidence: [],
  limitations: [],
  links: [],
  methodology: "Committed corpus match.",
  sections: [],
  summary: "Research complete.",
  title: "Saved Product brief",
  tool: "make_brief" as const,
};

describe("runStudioLazyReelResearchTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.convex.query.mockResolvedValue({ id: "product-123" });
    mocks.productFromDocument.mockReturnValue({ id: "product-123" });
    mocks.ground.mockReturnValue({
      product: "Saved Product facts",
      tool: "make_brief",
    });
    mocks.execute.mockReturnValue(result);
    mocks.convex.mutation.mockImplementation((operation) => {
      if (operation === mocks.pendingKey) {
        return Promise.resolve({
          created: true,
          run: { id: "new-run-id", status: "pending" },
        });
      }

      return Promise.resolve({ id: "new-run-id", status: "completed" });
    });
  });

  it("grounds the request in the owned Product before execution and persistence", async () => {
    const response = await runStudioLazyReelResearchTool({
      idempotencyKey: "request-123",
      productId: "product-123",
      request: { product: "Browser claim", tool: "make_brief" },
    });

    expect(mocks.convex.query).toHaveBeenCalledWith("get-product", {
      id: "product-123",
    });
    expect(mocks.execute).toHaveBeenCalledWith({
      product: "Saved Product facts",
      tool: "make_brief",
    });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      mocks.pendingKey,
      expect.objectContaining({
        idempotencyKey: "request-123",
        identity: { kind: "tool", key: "make_brief" },
        productId: "product-123",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      mocks.completeKey,
      expect.objectContaining({
        id: "new-run-id",
        outcome: "complete",
        productId: "product-123",
      }),
    );
    expect(response).toEqual({ created: true, result, runId: "new-run-id" });
  });

  it("returns an idempotent completed result without executing it again", async () => {
    mocks.convex.mutation.mockResolvedValueOnce({
      created: false,
      run: {
        id: "existing-run-id",
        resultSnapshot: { payloadJson: JSON.stringify(result) },
        status: "completed",
      },
    });

    const response = await runStudioLazyReelResearchTool({
      idempotencyKey: "request-123",
      productId: "product-123",
      request: { product: "Browser claim", tool: "make_brief" },
    });

    expect(mocks.execute).not.toHaveBeenCalled();
    expect(response).toMatchObject({ created: false, runId: "existing-run-id" });
  });
});
