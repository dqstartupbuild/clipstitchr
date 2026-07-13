import type { RawCampaignAsset } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignAsset";

export type RawCampaignConcept = {
  body: RawCampaignAsset;
  compatibilityScore: number;
  cta: RawCampaignAsset | null;
  hook: RawCampaignAsset;
  id: string;
  proof: RawCampaignAsset | null;
  sharedTags: readonly string[];
  title: string;
};
