import { describe, expect, it, vi } from "vitest";
import { reconcileProductsAfterPlanChange } from "./reconcileProductsAfterPlanChange";

describe("reconcileProductsAfterPlanChange", () => {
  it("keeps every existing product saved and locks excess products", async () => {
    const products = ["one", "two", "three"].map((id, index) => ({
      _id: `document_${id}`,
      archivedAt: undefined,
      createdAt: `2026-01-0${index + 1}T00:00:00.000Z`,
      id,
    }));
    const insert = vi.fn(async () => "reconciliation_1");
    const patch = vi.fn();
    const query = vi.fn((table: string) => ({
      withIndex: vi.fn(() => ({
        collect: vi.fn(async () => (table === "products" ? products : [])),
        take: vi.fn(async () => (table === "products" ? products : [])),
        unique: vi.fn(async () => null),
      })),
    }));
    const ctx = {
      db: { insert, patch, query },
    } as never;

    const result = await reconcileProductsAfterPlanChange(ctx, {
      eventId: "event_downgrade",
      now: "2026-07-16T00:00:00.000Z",
      ownerId: "owner_1",
      planKey: "starter",
    });

    expect(result).toEqual(["two", "three"]);
    expect(patch).not.toHaveBeenCalled();
    expect(products.every((product) => product.archivedAt === undefined)).toBe(
      true,
    );
    expect(insert).toHaveBeenCalledWith(
      "productLimitReconciliations",
      expect.objectContaining({
        archivedProductIds: [],
        lockedProductIds: ["two", "three"],
        reason: expect.stringContaining("stay saved but locked"),
      }),
    );
  });
});
