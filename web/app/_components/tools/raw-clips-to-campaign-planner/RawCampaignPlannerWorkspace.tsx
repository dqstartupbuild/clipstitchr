"use client";

import { useState } from "react";
import { RawCampaignAssetEditor } from "@/app/_components/tools/raw-clips-to-campaign-planner/RawCampaignAssetEditor";
import { RawCampaignPlanResults } from "@/app/_components/tools/raw-clips-to-campaign-planner/RawCampaignPlanResults";
import type { RawCampaignAsset } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignAsset";
import { buildRawClipsCampaignPlan } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/buildRawClipsCampaignPlan";
import { defaultRawCampaignAssets } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/defaultRawCampaignAssets";
import type { PublicToolPageGateProps } from "@/lib/clipstitchr/tools/catalog/PublicToolPageGateProps";

export function RawCampaignPlannerWorkspace({
  variant = "control",
}: PublicToolPageGateProps) {
  const [assets, setAssets] = useState<readonly RawCampaignAsset[]>(
    defaultRawCampaignAssets,
  );

  return (
    <section className="px-6 py-16" aria-label="Raw clips to campaign planner">
      <div className="mx-auto grid max-w-7xl gap-6">
        <RawCampaignAssetEditor assets={assets} onChange={setAssets} />
        <RawCampaignPlanResults
          assets={assets}
          plan={buildRawClipsCampaignPlan(assets)}
          variant={variant}
        />
      </div>
    </section>
  );
}
