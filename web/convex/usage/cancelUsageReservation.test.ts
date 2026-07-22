import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cancelUsageReservation } from "./cancelUsageReservation";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  releaseUsageReservationForOwner: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("./releaseUsageReservation", () => ({
  releaseUsageReservationForOwner: mocks.releaseUsageReservationForOwner,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext(reservation: {
  ownerId: string;
  reservationKind?: "browser" | "server" | "worker";
  workerQueueLinkedAt?: string;
}) {
  const indexQuery = { eq: vi.fn() };
  indexQuery.eq.mockReturnValue(indexQuery);
  const query = {
    unique: vi.fn(async () => reservation),
    withIndex: vi.fn(
      (_name: string, applyIndex: (value: typeof indexQuery) => unknown) => {
        applyIndex(indexQuery);
        return query;
      },
    ),
  };

  return { db: { query: vi.fn(() => query) } };
}

describe("cancelUsageReservation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("records cancellation lifecycle time from the server", async () => {
    const serverNow = "2026-07-16T12:00:00.000Z";
    vi.useFakeTimers();
    vi.setSystemTime(serverNow);
    const ctx = createContext({
      ownerId: "owner_123",
      reservationKind: "worker",
    });

    await getHandler(cancelUsageReservation)(ctx, {
      now: "2099-01-01T00:00:00.000Z",
      reason: "Canceled by user",
      reservationId: "reservation_1",
    });

    expect(mocks.releaseUsageReservationForOwner).toHaveBeenCalledWith(
      ctx,
      "owner_123",
      "reservation_1",
      serverNow,
      "Canceled by user",
    );
  });

  it("allows a worker reservation to be canceled before queue linkage", async () => {
    const ctx = createContext({
      ownerId: "owner_123",
      reservationKind: "worker",
    });

    await getHandler(cancelUsageReservation)(ctx, {
      now: "2000-01-01T00:00:00.000Z",
      reason: "Job could not be queued",
      reservationId: "reservation_1",
    });

    expect(mocks.releaseUsageReservationForOwner).toHaveBeenCalledOnce();
  });

  it("allows a browser reservation to be canceled", async () => {
    const ctx = createContext({
      ownerId: "owner_123",
      reservationKind: "browser",
    });

    await getHandler(cancelUsageReservation)(ctx, {
      now: "2000-01-01T00:00:00.000Z",
      reason: "Browser render failed",
      reservationId: "reservation_1",
    });

    expect(mocks.releaseUsageReservationForOwner).toHaveBeenCalledOnce();
  });

  it("keeps direct-server reservations under the server lifecycle", async () => {
    const ctx = createContext({
      ownerId: "owner_123",
      reservationKind: "server",
    });

    await expect(
      getHandler(cancelUsageReservation)(ctx, {
        now: "2000-01-01T00:00:00.000Z",
        reason: "Browser cancellation attempt",
        reservationId: "reservation_1",
      }),
    ).rejects.toThrow("cannot be canceled here");
    expect(mocks.releaseUsageReservationForOwner).not.toHaveBeenCalled();
  });

  it("rejects cancellation after a worker queue has linked the reservation", async () => {
    const ctx = createContext({
      ownerId: "owner_123",
      reservationKind: "worker",
      workerQueueLinkedAt: "2026-07-16T11:59:00.000Z",
    });

    await expect(
      getHandler(cancelUsageReservation)(ctx, {
        now: "2099-01-01T00:00:00.000Z",
        reason: "Malicious cancellation",
        reservationId: "reservation_1",
      }),
    ).rejects.toThrow("cannot be canceled here");
    expect(mocks.releaseUsageReservationForOwner).not.toHaveBeenCalled();
  });

  it("fails closed for legacy reservations without provenance", async () => {
    const ctx = createContext({ ownerId: "owner_123" });

    await expect(
      getHandler(cancelUsageReservation)(ctx, {
        now: "2026-07-16T12:00:00.000Z",
        reason: "Unknown cancellation",
        reservationId: "reservation_1",
      }),
    ).rejects.toThrow("cannot be canceled here");
    expect(mocks.releaseUsageReservationForOwner).not.toHaveBeenCalled();
  });
});
