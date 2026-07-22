import { beforeEach, describe, expect, it, vi } from "vitest";
import { reserveAnalysisCredit } from "./reserveAnalysisCredit";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  assertRateLimitApiSecret: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  releaseLegacyDirectAnalysisReservationsForOwner: vi.fn(),
  reserveCreationCreditsForOwner: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("./releaseLegacyDirectAnalysisReservationsForOwner", () => ({
  releaseLegacyDirectAnalysisReservationsForOwner:
    mocks.releaseLegacyDirectAnalysisReservationsForOwner,
}));
vi.mock("./reserveCreationCredits", () => ({
  reserveCreationCreditsForOwner: mocks.reserveCreationCreditsForOwner,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

describe("reserveAnalysisCredit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_1");
    mocks.reserveCreationCreditsForOwner.mockResolvedValue({
      reservationId: "reservation_1",
    });
  });

  it.each(["ai_analysis", "hook_lab_script"] as const)(
    "uses direct-server provenance for %s",
    async (operation) => {
      const ctx = {};
      const args = {
        domainId: "analysis_1",
        idempotencyKey: "analysis:1",
        now: "2026-07-22T12:00:00.000Z",
        operation,
        secret: "rate-secret",
      };

      await getHandler(reserveAnalysisCredit)(ctx, args);

      expect(
        mocks.releaseLegacyDirectAnalysisReservationsForOwner,
      ).toHaveBeenCalledWith(ctx, "owner_1", args.now);
      expect(mocks.reserveCreationCreditsForOwner).toHaveBeenCalledWith(
        ctx,
        "owner_1",
        expect.objectContaining({
          domainKind: "analysis",
          operation,
          reservationKind: "server",
        }),
      );
    },
  );

  it("keeps queued Hook Lab video analysis on worker provenance", async () => {
    const ctx = {};

    await getHandler(reserveAnalysisCredit)(ctx, {
      domainId: "post_1",
      idempotencyKey: "analysis:post_1",
      now: "2026-07-22T12:00:00.000Z",
      operation: "hook_lab_analysis",
      secret: "rate-secret",
    });

    expect(
      mocks.releaseLegacyDirectAnalysisReservationsForOwner,
    ).not.toHaveBeenCalled();
    expect(mocks.reserveCreationCreditsForOwner).toHaveBeenCalledWith(
      ctx,
      "owner_1",
      expect.objectContaining({ reservationKind: "worker" }),
    );
  });
});
