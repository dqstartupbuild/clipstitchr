import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateApprovalState } from "./updateApprovalState";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  activeProduct: vi.fn(),
  assertAccess: vi.fn(),
  auth: vi.fn(),
  consumeLimits: vi.fn(),
  getBrief: vi.fn(),
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
vi.mock("../studioLazyReel/consumeStudioLazyReelRecordWriteRateLimits", () => ({
  consumeStudioLazyReelRecordWriteRateLimits: mocks.consumeLimits,
}));
vi.mock("./getStudioLazyReelCreativeBriefForOwnerProduct", () => ({
  getStudioLazyReelCreativeBriefForOwnerProduct: mocks.getBrief,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

describe("studioLazyReelCreativeBriefs.updateApprovalState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue("owner_1");
    mocks.getBrief.mockResolvedValue({
      _id: "brief_doc",
      status: "active",
      approvalState: "approved",
      handoffDestination: "studio_edit",
    });
  });

  it("clears an approved handoff when approval is revoked", async () => {
    const ctx = { db: { patch: vi.fn() } };

    await expect(
      getHandler(updateApprovalState)(ctx, {
        id: "brief_1",
        productId: "product_1",
        approvalState: "rejected",
      }),
    ).resolves.toMatchObject({
      approvalState: "rejected",
      handoffDestination: undefined,
    });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "brief_doc",
      expect.objectContaining({
        approvalState: "rejected",
        approvedAt: undefined,
        handoffDestination: undefined,
      }),
    );
  });
});
