import { describe, expect, it } from "vitest";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import { getRecentSwiprSwipes } from "@/lib/clipstitchr/utils/getRecentSwiprSwipes";

function createSwipe(id: string, updatedAt: string): SwiprSwipe {
  return {
    id,
    name: id,
    productSourceType: "saved-product",
    productSourceId: "product-1",
    productContext: "",
    productName: "Product",
    backgroundId: "background-1",
    slides: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt,
  };
}

describe("getRecentSwiprSwipes", () => {
  it("returns Swipes by newest update date and applies the limit", () => {
    const swipes = [
      createSwipe("old", "2026-01-01T00:00:00.000Z"),
      createSwipe("newest", "2026-01-05T00:00:00.000Z"),
      createSwipe("middle", "2026-01-03T00:00:00.000Z"),
    ];

    expect(getRecentSwiprSwipes(swipes, 2).map((swipe) => swipe.id)).toEqual([
      "newest",
      "middle",
    ]);
  });
});
