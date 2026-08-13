import { beforeEach, describe, expect, it, vi } from "vitest";
import { complete } from "./complete";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  activeProduct: vi.fn(),
  assertAccess: vi.fn(),
  auth: vi.fn(),
  consumeLimits: vi.fn(),
  getRun: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.auth,
}));
vi.mock("../studioBetaAccess/assertStudioBetaAccess", () => ({
  assertStudioBetaAccess: mocks.assertAccess,
}));
vi.mock("../studioLazyReel/assertStudioLazyReelActiveProduct", () => ({
  assertStudioLazyReelActiveProduct: mocks.activeProduct,
}));
vi.mock("../studioLazyReel/consumeStudioLazyReelRunWriteRateLimits", () => ({
  consumeStudioLazyReelRunWriteRateLimits: mocks.consumeLimits,
}));
vi.mock("./getStudioLazyReelResearchRunForOwnerProduct", () => ({
  getStudioLazyReelResearchRunForOwnerProduct: mocks.getRun,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

const args = {
  id: "run_1",
  productId: "product_1",
  outcome: "partial" as const,
  resultSnapshot: {
    schemaVersion: "result.v1",
    payloadJson: '{"evidence":[],"warning":"limited sample"}',
  },
};

describe("studioLazyReelResearchRuns.complete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue("owner_1");
    mocks.getRun.mockResolvedValue({ _id: "run_doc", status: "pending" });
  });

  it("persists an explicit partial result as a terminal completion", async () => {
    const ctx = { db: { patch: vi.fn() } };

    await expect(getHandler(complete)(ctx, args)).resolves.toMatchObject({
      status: "completed",
      outcome: "partial",
      resultSnapshot: { schemaVersion: "result.v1" },
    });
    expect(mocks.consumeLimits).toHaveBeenCalledWith(ctx, "owner_1");
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "run_doc",
      expect.objectContaining({ status: "completed", outcome: "partial" }),
    );
  });

  it("does not overwrite a terminal run with a different outcome", async () => {
    mocks.getRun.mockResolvedValue({
      _id: "run_doc",
      status: "completed",
      outcome: "complete",
      resultSnapshot: {
        schemaVersion: "result.v1",
        payloadJson: '{"evidence":[]}',
      },
    });
    const ctx = { db: { patch: vi.fn() } };

    await expect(getHandler(complete)(ctx, args)).rejects.toThrow(
      "already terminal",
    );
    expect(mocks.consumeLimits).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});
