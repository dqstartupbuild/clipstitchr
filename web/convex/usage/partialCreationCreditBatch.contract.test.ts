import { ConvexError } from "convex/values";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { reserveCreationCreditBatch } from "./reserveCreationCreditBatch";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  reserveCreationCreditsForOwner: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("./reserveCreationCredits", () => ({
  reserveCreationCreditsForOwner: mocks.reserveCreationCreditsForOwner,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

describe("partial creation-credit batch contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
  });

  it("returns the funded prefix when the next item reaches a usage limit", async () => {
    mocks.reserveCreationCreditsForOwner
      .mockResolvedValueOnce({ reservationId: "reservation_1" })
      .mockResolvedValueOnce({ reservationId: "reservation_2" })
      .mockRejectedValueOnce(
        new ConvexError({
          code: "INSUFFICIENT_CREATION_CREDITS",
          message: "No more credits",
        }),
      );

    const result = await getHandler<
      {
        batchId: string;
        count: number;
        domainIdPrefix: string;
        domainKind: string;
        idempotencyPrefix: string;
        now: string;
        operation: "stitch";
      },
      Array<{ reservationId: string }>
    >(reserveCreationCreditBatch)(
      {},
      {
        batchId: "batch_1",
        count: 5,
        domainIdPrefix: "stitch",
        domainKind: "stitch",
        idempotencyPrefix: "stitch:batch_1",
        now: "2026-07-16T12:00:00.000Z",
        operation: "stitch",
      },
    );

    expect(result).toEqual([
      { reservationId: "reservation_1" },
      { reservationId: "reservation_2" },
    ]);
    expect(mocks.reserveCreationCreditsForOwner).toHaveBeenCalledTimes(3);
  });

  it("does not turn an unexpected failure into a partial success", async () => {
    mocks.reserveCreationCreditsForOwner.mockRejectedValueOnce(
      new Error("Database unavailable"),
    );

    await expect(
      getHandler(reserveCreationCreditBatch)(
        {},
        {
          batchId: "batch_1",
          count: 5,
          domainIdPrefix: "stitch",
          domainKind: "stitch",
          idempotencyPrefix: "stitch:batch_1",
          now: "2026-07-16T12:00:00.000Z",
          operation: "stitch",
        },
      ),
    ).rejects.toThrow("Database unavailable");
  });
});
