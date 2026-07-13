import { Plus } from "lucide-react";
import { RawCampaignAssetRow } from "@/app/_components/tools/raw-clips-to-campaign-planner/RawCampaignAssetRow";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { RawCampaignAsset } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignAsset";

type RawCampaignAssetEditorProps = {
  assets: readonly RawCampaignAsset[];
  onChange: (value: readonly RawCampaignAsset[]) => void;
};

export function RawCampaignAssetEditor({
  assets,
  onChange,
}: RawCampaignAssetEditorProps) {
  return (
    <Panel className="p-5 md:p-6">
      <PanelHeader
        eyebrow="Text-only inventory"
        title="Name the raw pieces you already have"
        description="Tags such as audience, angle, or payoff help related clips score higher together. No media is accepted here."
        actions={
          <button
            type="button"
            disabled={assets.length >= 24}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-bold text-text-primary disabled:opacity-40"
            onClick={() =>
              onChange([
                ...assets,
                {
                  id: `asset-${Date.now()}-${assets.length}`,
                  name: "",
                  role: "hook",
                  tags: "",
                },
              ])
            }
          >
            <Plus aria-hidden className="h-4 w-4" /> Add asset
          </button>
        }
      />
      <div className="mt-5 grid gap-3">
        {assets.map((asset, index) => (
          <RawCampaignAssetRow
            key={asset.id}
            asset={asset}
            onChange={(nextAsset) =>
              onChange(
                assets.map((current, currentIndex) =>
                  currentIndex === index ? nextAsset : current,
                ),
              )
            }
            onRemove={() =>
              onChange(
                assets.filter((_, currentIndex) => currentIndex !== index),
              )
            }
          />
        ))}
      </div>
    </Panel>
  );
}
