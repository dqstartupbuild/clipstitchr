import { RawCampaignConceptCard } from "@/app/_components/tools/raw-clips-to-campaign-planner/RawCampaignConceptCard";
import { CopyTextButton } from "@/app/_components/ui/CopyTextButton";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { RawCampaignAsset } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignAsset";
import type { RawCampaignPlan } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignPlan";
import { createRawCampaignPlanMarkdown } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/createRawCampaignPlanMarkdown";

type RawCampaignPlanResultsProps = {
  assets: readonly RawCampaignAsset[];
  plan: RawCampaignPlan;
};

export function RawCampaignPlanResults({
  assets,
  plan,
}: RawCampaignPlanResultsProps) {
  return (
    <Panel className="p-5 md:p-6">
      <PanelHeader
        eyebrow="Production handoff"
        title={`${plan.concepts.length} campaign concepts from ${plan.assetCount} named assets`}
        description="Compatibility scores use role completeness and repeated tags. They do not predict ad results."
        actions={
          <CopyTextButton
            label="Copy Markdown handoff"
            text={createRawCampaignPlanMarkdown(plan, assets)}
          />
        }
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-5">
        {plan.coverage.map((item) => (
          <div
            key={item.role}
            className="rounded-lg border border-border p-3 text-center"
          >
            <p className="text-2xl font-bold text-text-primary">{item.count}</p>
            <p className="mt-1 text-xs text-text-secondary">{item.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm font-semibold text-text-secondary">
        {plan.coveragePercent.toFixed(0)}% role coverage
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {plan.concepts.map((concept, index) => (
          <RawCampaignConceptCard
            key={concept.id}
            concept={concept}
            index={index}
          />
        ))}
      </div>
      {plan.concepts.length === 0 ? (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          Add at least one named hook and one named UGC or demo body clip to
          build concepts.
        </p>
      ) : null}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="font-bold text-text-primary">Missing captures</h3>
          <ul className="mt-2 grid gap-2 text-sm text-text-secondary">
            {(plan.missingCaptures.length
              ? plan.missingCaptures
              : ["No required role gaps found in this text inventory."]
            ).map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-text-primary">Reuse map</h3>
          <ul className="mt-2 grid gap-2 text-sm text-text-secondary">
            {plan.reuse.slice(0, 8).map((item) => (
              <li key={item.assetId}>
                • {item.assetName}: {item.useCount} concepts
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-6 text-xs leading-5 text-text-tertiary">
        Session-only text planning. No uploads, asset storage, stitching,
        rendering, scheduling, or campaign publishing.
      </p>
    </Panel>
  );
}
