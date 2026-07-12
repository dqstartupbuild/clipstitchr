import { afterEach, describe, expect, it } from "vitest";
import { getHookLabApifyMaxTotalChargeUsd } from "@/services/provider-worker/hookLab/getHookLabApifyMaxTotalChargeUsd";

const originalValue = process.env.HOOK_LAB_APIFY_MAX_TOTAL_CHARGE_USD;

afterEach(() => {
  if (originalValue === undefined) {
    delete process.env.HOOK_LAB_APIFY_MAX_TOTAL_CHARGE_USD;
    return;
  }

  process.env.HOOK_LAB_APIFY_MAX_TOTAL_CHARGE_USD = originalValue;
});

describe("getHookLabApifyMaxTotalChargeUsd", () => {
  it("uses Apify's minimum supported run cap by default", () => {
    delete process.env.HOOK_LAB_APIFY_MAX_TOTAL_CHARGE_USD;

    expect(getHookLabApifyMaxTotalChargeUsd()).toBe(0.5);
  });

  it("raises lower configured caps to Apify's supported minimum", () => {
    process.env.HOOK_LAB_APIFY_MAX_TOTAL_CHARGE_USD = "0.25";

    expect(getHookLabApifyMaxTotalChargeUsd()).toBe(0.5);
  });

  it("limits the maximum exposure to two dollars", () => {
    process.env.HOOK_LAB_APIFY_MAX_TOTAL_CHARGE_USD = "5";

    expect(getHookLabApifyMaxTotalChargeUsd()).toBe(2);
  });
});
