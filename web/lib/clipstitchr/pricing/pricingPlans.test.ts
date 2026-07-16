import { describe, expect, it } from "vitest";
import { pricingPlans } from "@/lib/clipstitchr/pricing/pricingPlans";

describe("pricingPlans", () => {
  it("keeps exact monthly prices machine-readable for scenario tools", () => {
    expect(
      pricingPlans.map(({ key, monthlyPriceUsd }) => [key, monthlyPriceUsd]),
    ).toEqual([
      ["starter", 39],
      ["pro", 99],
      ["agency", 399],
    ]);
  });

  it("does not make storage a plan choice", () => {
    expect(JSON.stringify(pricingPlans)).not.toContain("storage");
    expect(pricingPlans).toHaveLength(3);
  });

  it("keeps product and generation limits explicit", () => {
    expect(pricingPlans.map(({ products }) => products)).toEqual([
      "1 product",
      "3 products",
      "10 products",
    ]);
    expect(pricingPlans.map(({ credits }) => credits)).toEqual([
      "2,000 creation credits/month",
      "8,000 creation credits/month",
      "20,000 creation credits/month",
    ]);
  });

  it("carries each selected plan into account creation", () => {
    expect(pricingPlans.map(({ ctaHref }) => ctaHref)).toEqual([
      "/sign-up?plan=starter",
      "/sign-up?plan=pro",
      "/sign-up?plan=agency",
    ]);
  });
});
