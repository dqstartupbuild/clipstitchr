import { beforeEach, describe, expect, it, vi } from "vitest";
import { fail } from "./fail";

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

describe("studioLazyReelResearchRuns.fail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue("owner_1");
    mocks.getRun.mockResolvedValue({ _id: "run_doc", status: "pending" });
  });

  it("persists bounded structured failure details and retryability", async () => {
    const ctx = { db: { patch: vi.fn() } };

    await expect(
      getHandler(fail)(ctx, {
        id: "run_1",
        productId: "product_1",
        failure: {
          code: "UPSTREAM_UNAVAILABLE",
          message: "The corpus service did not respond.",
          retryable: true,
          detailsSnapshot: {
            schemaVersion: "failure.v1",
            payloadJson: '{"attempt":1}',
          },
        },
      }),
    ).resolves.toMatchObject({
      status: "failed",
      failure: {
        code: "UPSTREAM_UNAVAILABLE",
        retryable: true,
        detailsSnapshot: { schemaVersion: "failure.v1" },
      },
    });
    expect(mocks.consumeLimits).toHaveBeenCalledWith(ctx, "owner_1");
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "run_doc",
      expect.objectContaining({ status: "failed" }),
    );
  });
});
