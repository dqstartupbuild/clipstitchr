import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

describe("reserveCreationCreditBatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses one server timestamp for every reservation instead of client time", async () => {
    const serverNow = "2026-07-16T12:00:00.000Z";
    vi.useFakeTimers();
    vi.setSystemTime(serverNow);
    mocks.reserveCreationCreditsForOwner.mockResolvedValue({
      reservationId: "reservation_1",
    });

    await getHandler(reserveCreationCreditBatch)({}, {
      batchId: "batch_1",
      count: 2,
      domainIdPrefix: "stitch",
      domainKind: "stitch",
      idempotencyPrefix: "stitch:batch_1",
      now: "2099-01-01T00:00:00.000Z",
      operation: "stitch",
    });

    expect(mocks.reserveCreationCreditsForOwner).toHaveBeenCalledTimes(2);
    expect(mocks.reserveCreationCreditsForOwner).toHaveBeenNthCalledWith(
      1,
      {},
      "owner_123",
      expect.objectContaining({ now: serverNow }),
    );
    expect(mocks.reserveCreationCreditsForOwner).toHaveBeenNthCalledWith(
      2,
      {},
      "owner_123",
      expect.objectContaining({ now: serverNow }),
    );
  });
});
