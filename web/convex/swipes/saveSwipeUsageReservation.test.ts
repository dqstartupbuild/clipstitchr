import { beforeEach, describe, expect, it, vi } from "vitest";
import { save } from "../swipes";

type SaveHandler = {
  handler: (
    ctx: unknown,
    args: ReturnType<typeof createSaveArgs>,
  ) => Promise<string>;
};

const mocks = vi.hoisted(() => ({
  commitSwipeUsageReservation: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  query: vi.fn((definition) => definition),
  rateLimiter: { limit: vi.fn() },
  upsertSwipeCard: vi.fn(),
}));

vi.mock("../_generated/server", () => ({
  mutation: mocks.mutation,
  query: mocks.query,
}));

vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));

vi.mock("../rateLimiter", () => ({ rateLimiter: mocks.rateLimiter }));

vi.mock("../usage/commitSwipeUsageReservation", () => ({
  commitSwipeUsageReservation: mocks.commitSwipeUsageReservation,
}));

vi.mock("../upsertSwipeCard", () => ({
  upsertSwipeCard: mocks.upsertSwipeCard,
}));

function createSaveArgs(overrides: { usageReservationId?: string } = {}) {
  return {
    backgroundId: "background_1",
    createdAt: "2026-07-16T12:00:00.000Z",
    id: "swipe_1",
    name: "Generated Swipe",
    productContext: "A useful product",
    productName: "ClipStitchr",
    productSourceId: "product_1",
    productSourceType: "saved-product" as const,
    slides: [],
    updatedAt: "2026-07-16T12:05:00.000Z",
    ...overrides,
  };
}

function createContext(existingUsageReservationId: string) {
  const existingSwipe = {
    _id: "swipe_doc_1",
    id: "swipe_1",
    ownerId: "owner_123",
    usageReservationId: existingUsageReservationId,
  };
  const uniqueByTable = {
    products: { _id: "product_doc_1", id: "product_1", ownerId: "owner_123" },
    swipes: existingSwipe,
    swiprBackgrounds: {
      _id: "background_doc_1",
      id: "background_1",
      uploadedByOwnerId: "owner_123",
    },
  };
  const db = {
    get: vi.fn(async () => existingSwipe),
    insert: vi.fn(),
    patch: vi.fn(),
    query: vi.fn((table: keyof typeof uniqueByTable) => {
      const indexQuery = { eq: vi.fn() };
      indexQuery.eq.mockReturnValue(indexQuery);
      const chain = {
        unique: vi.fn(async () => uniqueByTable[table]),
        withIndex: vi.fn(
          (
            _name: string,
            applyIndex: (query: typeof indexQuery) => unknown,
          ) => {
            applyIndex(indexQuery);
            return chain;
          },
        ),
      };

      return chain;
    }),
  };

  return { ctx: { db }, db };
}

describe("generated Swipe edit usage reservation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("preserves the generated Swipe reservation when the client edit omits it", async () => {
    const { ctx, db } = createContext("reservation_generated");

    await expect(
      (save as unknown as SaveHandler).handler(ctx, createSaveArgs()),
    ).resolves.toBe("swipe_doc_1");

    expect(mocks.commitSwipeUsageReservation).not.toHaveBeenCalled();
    expect(db.patch).toHaveBeenCalledWith(
      "swipe_doc_1",
      expect.objectContaining({
        usageReservationId: "reservation_generated",
      }),
    );
  });

  it("rejects an explicitly supplied reservation from another generation", async () => {
    const { ctx, db } = createContext("reservation_generated");

    await expect(
      (save as unknown as SaveHandler).handler(
        ctx,
        createSaveArgs({ usageReservationId: "reservation_other" }),
      ),
    ).rejects.toThrow("Swipe already has a different usage reservation.");

    expect(mocks.commitSwipeUsageReservation).not.toHaveBeenCalled();
    expect(db.patch).not.toHaveBeenCalled();
  });
});
