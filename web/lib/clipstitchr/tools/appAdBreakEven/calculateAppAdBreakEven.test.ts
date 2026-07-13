import { describe, expect, it } from "vitest";
import type { AppAdBreakEvenInput } from "@/lib/clipstitchr/tools/appAdBreakEven/AppAdBreakEvenInput";
import { calculateAppAdBreakEven } from "@/lib/clipstitchr/tools/appAdBreakEven/calculateAppAdBreakEven";
import { defaultAppAdBreakEvenInput } from "@/lib/clipstitchr/tools/appAdBreakEven/defaultAppAdBreakEvenInput";

describe("calculateAppAdBreakEven", () => {
  it("calculates the complete break-even scenario", () => {
    const result = calculateAppAdBreakEven(defaultAppAdBreakEvenInput);

    expect(result).toMatchObject({
      contributionPerCustomer: 90,
      totalAcquisitionInvestment: 6000,
      minimumRevenueNeeded: 8000,
      breakEvenCustomers: 67,
      breakEvenCustomerStatus: "ready",
      breakEvenInstalls: 1340,
      breakEvenInstallStatus: "ready",
      maximumBlendedCac: 90,
      maximumBlendedCpi: 4.5,
      breakEvenMediaRoas: 1.6,
      revenueAtWholeCustomerThreshold: 8040,
      revenueWindow: "90-days",
    });
    expect(result.creativeCostSharePercentage).toBeCloseTo(100 / 6);
    expect(result.mediaCostSharePercentage).toBeCloseTo(500 / 6);
  });

  it("rounds whole customer and install targets upward", () => {
    const result = calculateAppAdBreakEven({
      ...defaultAppAdBreakEvenInput,
      mediaSpend: 100,
      creativeProductionCost: 0,
      revenuePerPayingCustomer: 60,
      contributionMarginPercentage: 100,
      installToPaidPercentage: 30,
    });

    expect(result.breakEvenCustomers).toBe(2);
    expect(result.breakEvenInstalls).toBe(7);
  });

  it("returns zero targets when there is no acquisition cost", () => {
    const result = calculateAppAdBreakEven({
      ...defaultAppAdBreakEvenInput,
      mediaSpend: 0,
      creativeProductionCost: 0,
      revenuePerPayingCustomer: 0,
      contributionMarginPercentage: 0,
      installToPaidPercentage: 0,
    });

    expect(result.minimumRevenueNeeded).toBe(0);
    expect(result.breakEvenCustomers).toBe(0);
    expect(result.breakEvenInstalls).toBe(0);
    expect(result.breakEvenMediaRoas).toBeNull();
  });

  it.each([
    ["zero customer revenue", { revenuePerPayingCustomer: 0 }],
    ["zero contribution margin", { contributionMarginPercentage: 0 }],
  ])("marks the customer target unavailable for %s", (_label, override) => {
    const result = calculateAppAdBreakEven({
      ...defaultAppAdBreakEvenInput,
      ...override,
    } as AppAdBreakEvenInput);

    expect(result.breakEvenCustomers).toBeNull();
    expect(result.breakEvenCustomerStatus).toBe("missing-customer-value");
    expect(result.breakEvenInstalls).toBeNull();
    expect(JSON.stringify(result)).not.toContain("Infinity");
  });

  it("keeps the customer target when the conversion rate is missing", () => {
    const result = calculateAppAdBreakEven({
      ...defaultAppAdBreakEvenInput,
      installToPaidPercentage: 0,
    });

    expect(result.breakEvenCustomers).toBe(67);
    expect(result.breakEvenInstalls).toBeNull();
    expect(result.breakEvenInstallStatus).toBe("missing-conversion-rate");
    expect(result.maximumBlendedCpi).toBeNull();
  });

  it("supports media-only and creative-only scenarios", () => {
    const mediaOnly = calculateAppAdBreakEven({
      ...defaultAppAdBreakEvenInput,
      creativeProductionCost: 0,
    });
    const creativeOnly = calculateAppAdBreakEven({
      ...defaultAppAdBreakEvenInput,
      mediaSpend: 0,
    });

    expect(mediaOnly.breakEvenCustomers).toBe(56);
    expect(mediaOnly.breakEvenMediaRoas).toBeCloseTo(4 / 3);
    expect(creativeOnly.breakEvenCustomers).toBe(12);
    expect(creativeOnly.breakEvenMediaRoas).toBeNull();
  });

  it("marks unsafe whole-number targets outside the useful range", () => {
    const result = calculateAppAdBreakEven({
      ...defaultAppAdBreakEvenInput,
      mediaSpend: 10_000_000,
      creativeProductionCost: 1_000_000,
      revenuePerPayingCustomer: 0.01,
      contributionMarginPercentage: 0.01,
      installToPaidPercentage: 0.01,
    });

    expect(result.breakEvenCustomers).toBe(11_000_000_000_000);
    expect(result.breakEvenInstalls).toBeNull();
    expect(result.breakEvenInstallStatus).toBe("outside-range");
  });

  it("normalizes unsafe, negative, oversized, and unknown values", () => {
    const result = calculateAppAdBreakEven({
      ...defaultAppAdBreakEvenInput,
      mediaSpend: Number.POSITIVE_INFINITY,
      creativeProductionCost: -20,
      revenuePerPayingCustomer: 2_000_000,
      contributionMarginPercentage: 180,
      installToPaidPercentage: 120,
      revenueWindow: "unknown" as AppAdBreakEvenInput["revenueWindow"],
    });

    expect(result.mediaSpend).toBe(0);
    expect(result.creativeProductionCost).toBe(0);
    expect(result.revenuePerPayingCustomer).toBe(1_000_000);
    expect(result.contributionMarginPercentage).toBe(100);
    expect(result.installToPaidPercentage).toBe(100);
    expect(result.revenueWindow).toBe("90-days");
    expect(JSON.stringify(result)).not.toContain("NaN");
    expect(JSON.stringify(result)).not.toContain("Infinity");
  });
});
