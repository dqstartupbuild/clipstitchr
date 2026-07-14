import { PublicToolGateActionBoundary } from "@/app/_components/tools/gates/PublicToolGateActionBoundary";
import { ResourceDownloadButton } from "@/app/_components/tools/resources/ResourceDownloadButton";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import { createCreativeAssetInventoryCsv } from "@/lib/clipstitchr/tools/creativeAssetInventory/createCreativeAssetInventoryCsv";
import { createCreativeAssetInventoryMarkdown } from "@/lib/clipstitchr/tools/creativeAssetInventory/createCreativeAssetInventoryMarkdown";
import type { CreativeAssetInventoryRow } from "@/lib/clipstitchr/tools/creativeAssetInventory/CreativeAssetInventoryRow";

type CreativeAssetInventoryExportsProps = {
  hasFunctionalUnlock?: boolean;
  rows: readonly CreativeAssetInventoryRow[];
  variant?: PublicToolGateVariant;
};

export function CreativeAssetInventoryExports({
  hasFunctionalUnlock = false,
  rows,
  variant = "control",
}: CreativeAssetInventoryExportsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <PublicToolGateActionBoundary
        hasFunctionalUnlock={hasFunctionalUnlock}
        toolKey="app-creative-asset-inventory-template"
        variant={variant}
      >
        <ResourceDownloadButton
          contents={createCreativeAssetInventoryCsv(rows)}
          fileName="clipstitchr-creative-asset-inventory.csv"
          label="Download CSV"
          type="text/csv;charset=utf-8"
        />
      </PublicToolGateActionBoundary>
      <ResourceDownloadButton
        contents={createCreativeAssetInventoryMarkdown(rows)}
        fileName="clipstitchr-creative-asset-inventory.md"
        label="Download Markdown"
        type="text/markdown;charset=utf-8"
      />
    </div>
  );
}
