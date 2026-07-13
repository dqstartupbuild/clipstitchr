import { describe, expect, it } from "vitest";
import { buildRawClipsCampaignPlan } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/buildRawClipsCampaignPlan";
import { defaultRawCampaignAssets } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/defaultRawCampaignAssets";

describe("buildRawClipsCampaignPlan", () => {
  it("creates six diverse, scored concepts with coverage and reuse", () => {
    const result = buildRawClipsCampaignPlan(defaultRawCampaignAssets);

    expect(result.concepts).toHaveLength(6);
    expect(new Set(result.concepts.map((concept) => concept.title)).size).toBe(
      6,
    );
    expect(
      result.concepts.every((concept) => concept.compatibilityScore >= 90),
    ).toBe(true);
    expect(result.coveragePercent).toBe(100);
    expect(result.missingCaptures).toEqual([]);
    expect(result.reuse[0].useCount).toBeGreaterThan(1);
  });

  it("names missing captures and avoids fake concepts without an opening", () => {
    const result = buildRawClipsCampaignPlan(
      defaultRawCampaignAssets.filter((asset) => asset.role === "demo"),
    );

    expect(result.concepts).toEqual([]);
    expect(result.missingCaptures).toContain(
      "Capture at least one hook or opening.",
    );
    expect(result.missingCaptures).toContain(
      "Capture one clear call-to-action ending.",
    );
  });

  it("caps text inventory work at twenty-four assets and concepts at six", () => {
    const repeated = Array.from({ length: 40 }, (_, index) => ({
      ...defaultRawCampaignAssets[index % defaultRawCampaignAssets.length],
      id: `asset-${index}`,
      name: `Asset ${index}`,
    }));
    const result = buildRawClipsCampaignPlan(repeated);

    expect(result.assetCount).toBe(24);
    expect(result.concepts.length).toBeLessThanOrEqual(6);
  });
});
