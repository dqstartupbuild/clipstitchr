import { describe, expect, it } from "vitest";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { getProductSwiprContext } from "@/lib/clipstitchr/utils/getProductSwiprContext";

describe("getProductSwiprContext", () => {
  it("includes visible and inferred product details", () => {
    const product: ProductProfile = {
      id: "product-1",
      name: "LaunchKit",
      productDetails: "AI content planning workspace",
      audienceDetails: "Solo founders",
      inferredProblem: "Planning ad content takes too long.",
      inferredPainPoints: ["Blank page anxiety", "No weekly publishing rhythm"],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    expect(getProductSwiprContext(product)).toContain("LaunchKit");
    expect(getProductSwiprContext(product)).toContain("Problem solved");
    expect(getProductSwiprContext(product)).toContain("Blank page anxiety");
  });
});
