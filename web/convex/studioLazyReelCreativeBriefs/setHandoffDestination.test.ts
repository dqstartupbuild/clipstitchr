import { beforeEach, describe, expect, it, vi } from "vitest";
import { setHandoffDestination } from "./setHandoffDestination";

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

describe("studioLazyReelCreativeBriefs.setHandoffDestination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue("owner_1");
  });

  it("only stores a handoff on an active approved brief", async () => {
    mocks.getBrief.mockResolvedValue({
      _id: "brief_doc",
      status: "active",
      approvalState: "approved",
    });
    const ctx = { db: { patch: vi.fn() } };

    await expect(
      getHandler(setHandoffDestination)(ctx, {
        id: "brief_1",
        productId: "product_1",
        destination: "studio_stitch",
      }),
    ).resolves.toMatchObject({ handoffDestination: "studio_stitch" });
    expect(mocks.consumeLimits.mock.invocationCallOrder[0]).toBeLessThan(
      ctx.db.patch.mock.invocationCallOrder[0],
    );
  });

  it("rejects a destination for a draft brief", async () => {
    mocks.getBrief.mockResolvedValue({
      _id: "brief_doc",
      status: "active",
      approvalState: "draft",
    });
    const ctx = { db: { patch: vi.fn() } };

    await expect(
      getHandler(setHandoffDestination)(ctx, {
        id: "brief_1",
        productId: "product_1",
        destination: "studio_edit",
      }),
    ).rejects.toThrow("Approve the active creative brief");
    expect(mocks.consumeLimits).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});
