import { describe, expect, it } from "vitest";
import { pricingPlans } from "@/lib/clipstitchr/pricing/pricingPlans";

describe("pricingPlans", () => {
  it("keeps exact monthly prices machine-readable for scenario tools", () => {
    expect(
      pricingPlans.map(({ key, monthlyPriceUsd }) => [key, monthlyPriceUsd]),
    ).toEqual([
      ["starter", 39],
      ["pro", 99],
      ["studio", 249],
      ["agency", null],
    ]);
  });
});
