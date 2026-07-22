import { beforeEach, describe, expect, it, vi } from "vitest";
import { commitAnalysisCredit } from "./commitAnalysisCredit";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  assertRateLimitApiSecret: vi.fn(),
  commitUsageReservationForOwner: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("./commitUsageReservation", () => ({
  commitUsageReservationForOwner: mocks.commitUsageReservationForOwner,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

describe("commitAnalysisCredit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_1");
    mocks.commitUsageReservationForOwner.mockResolvedValue({
      state: "committed",
    });
  });

  it.each(["ai_analysis", "hook_lab_script"] as const)(
    "commits %s with direct-server provenance",
    async (operation) => {
      const ctx = {};

      await getHandler(commitAnalysisCredit)(ctx, {
        domainId: "analysis_1",
        now: "2026-07-22T12:00:00.000Z",
        operation,
        reservationId: "reservation_1",
        secret: "rate-secret",
      });

      expect(mocks.commitUsageReservationForOwner).toHaveBeenCalledWith(
        ctx,
        "owner_1",
        "reservation_1",
        "2026-07-22T12:00:00.000Z",
        "user_action",
        expect.objectContaining({
          operation,
          reservationKind: "server",
        }),
      );
    },
  );

  it("keeps queued Hook Lab video analysis on worker provenance", async () => {
    await getHandler(commitAnalysisCredit)({}, {
      domainId: "post_1",
      now: "2026-07-22T12:00:00.000Z",
      operation: "hook_lab_analysis",
      reservationId: "reservation_1",
      secret: "rate-secret",
    });

    expect(mocks.commitUsageReservationForOwner).toHaveBeenCalledWith(
      expect.anything(),
      "owner_1",
      "reservation_1",
      expect.any(String),
      "user_action",
      expect.objectContaining({ reservationKind: "worker" }),
    );
  });
});
