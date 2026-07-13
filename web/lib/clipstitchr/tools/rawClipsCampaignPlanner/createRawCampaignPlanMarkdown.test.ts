import { describe, expect, it } from "vitest";
import { buildRawClipsCampaignPlan } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/buildRawClipsCampaignPlan";
import { createRawCampaignPlanMarkdown } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/createRawCampaignPlanMarkdown";
import { defaultRawCampaignAssets } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/defaultRawCampaignAssets";

describe("createRawCampaignPlanMarkdown", () => {
  it("creates a complete production handoff without media or performance claims", () => {
    const markdown = createRawCampaignPlanMarkdown(
      buildRawClipsCampaignPlan(defaultRawCampaignAssets),
      defaultRawCampaignAssets,
    );

    expect(markdown).toContain("## Asset inventory");
    expect(markdown).toContain("## Campaign concepts");
    expect(markdown).toContain("## Missing captures");
    expect(markdown).toContain("## Reuse map");
    expect(markdown).toContain("not predicted ad performance");
  });
});
