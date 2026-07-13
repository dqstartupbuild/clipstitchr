import type { RawCampaignAssetRole } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignAssetRole";

export type RawCampaignCoverage = {
  count: number;
  label: string;
  role: RawCampaignAssetRole;
};
