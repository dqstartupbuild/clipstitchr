import { beforeEach, describe, expect, it, vi } from "vitest";
import { save } from "./save";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  activeProduct: vi.fn(),
  assertAccess: vi.fn(),
  auth: vi.fn(),
  consumeLimits: vi.fn(),
  getReport: vi.fn(),
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
vi.mock("../studioLazyReel/consumeStudioLazyReelRecordWriteRateLimits", () => ({
  consumeStudioLazyReelRecordWriteRateLimits: mocks.consumeLimits,
}));
vi.mock("../studioLazyReelResearchRuns/getStudioLazyReelResearchRunForOwnerProduct", () => ({
  getStudioLazyReelResearchRunForOwnerProduct: mocks.getRun,
}));
vi.mock("./getStudioLazyReelSavedReportForOwnerProduct", () => ({
  getStudioLazyReelSavedReportForOwnerProduct: mocks.getReport,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

const identity = { kind: "tool" as const, key: "niche_report" as const };
const args = {
  id: "report_1",
  productId: "product_1",
  researchRunId: "run_1",
  title: "Pet niche report",
  identity,
  sourceSnapshotVersion: "lazyreel-v1",
  reportSnapshot: {
    schemaVersion: "report.v1",
    payloadJson: '{"evidence":["observed"]}',
  },
};

describe("studioLazyReelSavedReports.save", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue("owner_1");
    mocks.getReport.mockResolvedValue(null);
    mocks.getRun.mockResolvedValue({
      status: "completed",
      identity,
      sourceSnapshotVersion: "lazyreel-v1",
    });
  });

  it("refuses to link a report to a run outside the owner and Product scope", async () => {
    mocks.getRun.mockResolvedValue(null);
    const ctx = { db: { get: vi.fn(), insert: vi.fn() } };

    await expect(getHandler(save)(ctx, args)).rejects.toThrow(
      "Completed research run not found",
    );
    expect(mocks.getRun).toHaveBeenCalledWith(
      ctx,
      "owner_1",
      "product_1",
      "run_1",
    );
    expect(mocks.consumeLimits).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("rate limits before saving a bounded report", async () => {
    const report = { _id: "report_doc", status: "active" };
    const ctx = {
      db: {
        get: vi.fn().mockResolvedValue(report),
        insert: vi.fn().mockResolvedValue("report_doc"),
      },
    };

    await expect(getHandler(save)(ctx, args)).resolves.toEqual({
      created: true,
      report,
    });
    expect(mocks.consumeLimits.mock.invocationCallOrder[0]).toBeLessThan(
      ctx.db.insert.mock.invocationCallOrder[0],
    );
  });
});
