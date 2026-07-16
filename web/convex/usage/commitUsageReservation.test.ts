import { describe, expect, it, vi } from "vitest";
import { commitUsageReservationForOwner } from "./commitUsageReservation";

function createContext(reservation: Record<string, unknown>) {
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

  return {
    db: {
      patch: vi.fn(),
      query: vi.fn(() => query),
    },
  };
}

const binding = {
  domainId: "stitch_1",
  domainKind: "stitch",
  operation: "stitch" as const,
  reservationKind: "browser" as const,
  resource: "creation_credit" as const,
};

const committedReservation = {
  _id: "reservation_doc_1",
  commitDomainId: binding.domainId,
  commitDomainKind: binding.domainKind,
  domainId: binding.domainId,
  domainKind: binding.domainKind,
  operation: binding.operation,
  ownerId: "owner_1",
  reservationKind: binding.reservationKind,
  reservationId: "reservation_1",
  resource: binding.resource,
  state: "committed",
};

describe("commitUsageReservationForOwner", () => {
  it("returns an idempotent committed reservation only for the same binding", async () => {
    const ctx = createContext(committedReservation);

    await expect(
      commitUsageReservationForOwner(
        ctx as never,
        committedReservation.ownerId,
        committedReservation.reservationId,
        "2026-07-16T12:00:00.000Z",
        "user_action",
        binding,
      ),
    ).resolves.toBe(committedReservation);
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("rejects a committed reservation replayed into another domain", async () => {
    const ctx = createContext(committedReservation);

    await expect(
      commitUsageReservationForOwner(
        ctx as never,
        committedReservation.ownerId,
        committedReservation.reservationId,
        "2026-07-16T12:00:00.000Z",
        "user_action",
        { ...binding, domainId: "stitch_2" },
      ),
    ).rejects.toThrow("does not match this creation");
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it.each([
    ["domain", { domainId: "stitch_2" }],
    ["operation", { operation: "swipr" as const }],
    ["resource", { resource: "ai_video" as const }],
    ["provenance", { reservationKind: "worker" as const }],
  ])(
    "rejects reserved cross-%s usage before spending",
    async (_label, patch) => {
      const ctx = createContext({
        ...committedReservation,
        commitDomainId: undefined,
        commitDomainKind: undefined,
        state: "reserved",
      });

      await expect(
        commitUsageReservationForOwner(
          ctx as never,
          committedReservation.ownerId,
          committedReservation.reservationId,
          "2026-07-16T12:00:00.000Z",
          "user_action",
          { ...binding, ...patch },
        ),
      ).rejects.toThrow("does not match this creation");
      expect(ctx.db.patch).not.toHaveBeenCalled();
    },
  );
});
