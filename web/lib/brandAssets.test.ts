import { describe, expect, it } from "vitest";
import { brandAssets } from "@/lib/brandAssets";

describe("brandAssets", () => {
  it("exposes the public BIMI logo URL", () => {
    expect(brandAssets.bimiLogo).toBe("/brand/v2/bimi-logo.svg");
  });

  it("keeps every active brand asset on the v2 cache namespace", () => {
    const activeAssets = Object.entries(brandAssets)
      .filter(([key]) => key !== "cacheVersion" && key !== "bimiLogo")
      .map(([, value]) => value);

    expect(activeAssets).not.toHaveLength(0);

    for (const asset of activeAssets) {
      expect(asset).toContain("/v2/");
      expect(asset.endsWith(`?v=${brandAssets.cacheVersion}`)).toBe(true);
    }
  });
});
