import { describe, expect, it } from "vitest";
import { createSwiprPostDescriptionFallback } from "@/lib/clipstitchr/utils/createSwiprPostDescriptionFallback";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

const product: ProductProfile = {
  audienceDetails: "solo app founders",
  createdAt: "2026-01-01T00:00:00.000Z",
  id: "product_1",
  inferredPainPoints: ["launch assets get scattered"],
  inferredProblem: "launch assets get scattered",
  name: "Launch Kit",
  productDetails: "Keeps launch assets together",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("createSwiprPostDescriptionFallback", () => {
  it("builds a concise fallback only from supplied context", () => {
    const description = createSwiprPostDescriptionFallback({
      caption: "Friday should not disappear into launch prep",
      product,
      slides: [
        "Friday should not disappear into launch prep",
        "Put every clip in one place",
      ],
    });

    expect(description).toBe(
      "Friday should not disappear into launch prep\n\nFor solo app founders: launch assets get scattered.\n\n- Put every clip in one place",
    );
    expect(description.length).toBeLessThan(300);
    expect(description).not.toContain("If this made you pause");
  });
});
