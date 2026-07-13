import type { RawCampaignConcept } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignConcept";
import type { RawCampaignCoverage } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignCoverage";
import type { RawCampaignReuse } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignReuse";

export type RawCampaignPlan = {
  assetCount: number;
  concepts: readonly RawCampaignConcept[];
  coverage: readonly RawCampaignCoverage[];
  coveragePercent: number;
  missingCaptures: readonly string[];
  reuse: readonly RawCampaignReuse[];
};
