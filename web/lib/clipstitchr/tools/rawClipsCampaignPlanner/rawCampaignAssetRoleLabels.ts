import type { RawCampaignAssetRole } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignAssetRole";

export const rawCampaignAssetRoleLabels: Readonly<
  Record<RawCampaignAssetRole, string>
> = {
  hook: "Hook or opening",
  ugc: "UGC body clip",
  demo: "Product demo",
  proof: "Proof or outcome",
  cta: "Call to action",
};
