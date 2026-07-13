import { CreativeAssetInventoryExports } from "@/app/_components/tools/creative-asset-inventory/CreativeAssetInventoryExports";
import { CreativeAssetInventoryGapList } from "@/app/_components/tools/creative-asset-inventory/CreativeAssetInventoryGapList";
import { ToolMetricCard } from "@/app/_components/tools/ToolMetricCard";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import { calculateCreativeAssetInventory } from "@/lib/clipstitchr/tools/creativeAssetInventory/calculateCreativeAssetInventory";
import type { CreativeAssetInventoryRow } from "@/lib/clipstitchr/tools/creativeAssetInventory/CreativeAssetInventoryRow";

type CreativeAssetInventoryResultsProps = {
  rows: readonly CreativeAssetInventoryRow[];
};

export function CreativeAssetInventoryResults({
  rows,
}: CreativeAssetInventoryResultsProps) {
  const result = calculateCreativeAssetInventory(rows);

  return (
    <Panel className="p-5 md:p-6 lg:sticky lg:top-24">
      <PanelHeader
        eyebrow="Current coverage"
        title={
          result.coveragePercent === null
            ? "Count at least one asset"
            : `${result.coveragePercent.toFixed(1)}% marked ready`
        }
        description="Coverage is ready divided by every counted status. It is not a quality or rights approval."
        actions={<CreativeAssetInventoryExports rows={rows} />}
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ToolMetricCard
          description="Usable in the next production round."
          label="Ready"
          value={String(result.ready)}
        />
        <ToolMetricCard
          description="Exists but still needs attention."
          label="Needs work"
          value={String(result.needsWork)}
        />
        <ToolMetricCard
          description="Known source material not captured yet."
          label="Missing"
          value={String(result.missing)}
        />
        <ToolMetricCard
          description="Not ready until usage details are confirmed."
          label="Rights unknown"
          value={String(result.rightsUnknown)}
        />
      </div>
      <CreativeAssetInventoryGapList gaps={result.gaps} />
      <p className="mt-6 text-xs leading-5 text-text-tertiary">
        This worksheet does not store files, verify rights, or create ads.
        Download your current inventory before leaving if you want to keep it.
      </p>
    </Panel>
  );
}
