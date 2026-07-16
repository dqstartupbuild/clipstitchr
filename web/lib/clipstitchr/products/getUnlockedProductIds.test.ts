import { describe, expect, it } from "vitest";
import { getUnlockedProductIds } from "./getUnlockedProductIds";

const products = [
  { createdAt: "2026-01-03T00:00:00.000Z", id: "newest" },
  { createdAt: "2026-01-01T00:00:00.000Z", id: "oldest" },
  { createdAt: "2026-01-02T00:00:00.000Z", id: "middle" },
];

describe("getUnlockedProductIds", () => {
  it("keeps the saved default unlocked before filling remaining slots", () => {
    expect(getUnlockedProductIds(products, "newest", 2)).toEqual([
      "newest",
      "oldest",
    ]);
  });

  it("falls back to the oldest active product deterministically", () => {
    expect(getUnlockedProductIds(products, "missing", 2)).toEqual([
      "oldest",
      "middle",
    ]);
  });

  it("never gives archived products a slot", () => {
    expect(
      getUnlockedProductIds(
        [...products, { archivedAt: "2026-02-01", createdAt: "2025-01-01", id: "archived" }],
        "archived",
        1,
      ),
    ).toEqual(["oldest"]);
  });

  it("returns no unlocked products when the limit is zero", () => {
    expect(getUnlockedProductIds(products, "oldest", 0)).toEqual([]);
  });
});
