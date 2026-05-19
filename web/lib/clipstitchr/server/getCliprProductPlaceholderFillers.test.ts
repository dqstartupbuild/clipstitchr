import { describe, expect, it } from "vitest";
import { getCliprProductPlaceholderFillers } from "@/lib/clipstitchr/server/getCliprProductPlaceholderFillers";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

const product: ProductProfile = {
  id: "product_1",
  name: "LaunchKit",
  productDetails: "Helps founders organize product launch content.",
  audienceDetails: "Founders and solo marketers.",
  cliprPlaceholderFillers: {
    topic: ["Problem solved: launch content chaos."],
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  inferredPainPoints: ["launch content gets scattered"],
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("getCliprProductPlaceholderFillers", () => {
  it("cleans labels and helper wording before prompt construction", () => {
    const fillers = getCliprProductPlaceholderFillers(product);

    expect(fillers.topic).toContain("organize product launch content");
    expect(fillers.topic).toContain("launch content chaos");
    expect(fillers.topic).not.toContain("Problem solved: launch content chaos.");
  });

  it("adds reaction-quality fallback fillers for identity challenge templates", () => {
    const fillers = getCliprProductPlaceholderFillers(product);

    expect(fillers.core_belief).toContain(
      "doing it manually means it is more authentic",
    );
    expect(fillers.popular_method).toContain("doing everything manually");
    expect(fillers.identity).toContain("Founders and solo marketers");
    expect(fillers.time).toContain("3 hours per post");
  });
});
