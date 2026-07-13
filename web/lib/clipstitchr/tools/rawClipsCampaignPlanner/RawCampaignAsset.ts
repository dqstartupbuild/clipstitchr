import type { RawCampaignAssetRole } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignAssetRole";

export type RawCampaignAsset = {
  id: string;
  name: string;
  role: RawCampaignAssetRole;
  tags: string;
};
