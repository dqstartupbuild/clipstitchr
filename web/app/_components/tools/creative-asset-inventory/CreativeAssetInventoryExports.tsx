import { ResourceDownloadButton } from "@/app/_components/tools/resources/ResourceDownloadButton";
import { createCreativeAssetInventoryCsv } from "@/lib/clipstitchr/tools/creativeAssetInventory/createCreativeAssetInventoryCsv";
import { createCreativeAssetInventoryMarkdown } from "@/lib/clipstitchr/tools/creativeAssetInventory/createCreativeAssetInventoryMarkdown";
import type { CreativeAssetInventoryRow } from "@/lib/clipstitchr/tools/creativeAssetInventory/CreativeAssetInventoryRow";

type CreativeAssetInventoryExportsProps = {
  rows: readonly CreativeAssetInventoryRow[];
};

export function CreativeAssetInventoryExports({
  rows,
}: CreativeAssetInventoryExportsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <ResourceDownloadButton
        contents={createCreativeAssetInventoryCsv(rows)}
        fileName="clipstitchr-creative-asset-inventory.csv"
        label="Download CSV"
        type="text/csv;charset=utf-8"
      />
      <ResourceDownloadButton
        contents={createCreativeAssetInventoryMarkdown(rows)}
        fileName="clipstitchr-creative-asset-inventory.md"
        label="Download Markdown"
        type="text/markdown;charset=utf-8"
      />
    </div>
  );
}
