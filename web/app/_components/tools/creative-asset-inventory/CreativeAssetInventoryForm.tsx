import { CreativeAssetInventoryRowEditor } from "@/app/_components/tools/creative-asset-inventory/CreativeAssetInventoryRowEditor";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { CreativeAssetInventoryRow } from "@/lib/clipstitchr/tools/creativeAssetInventory/CreativeAssetInventoryRow";

type CreativeAssetInventoryFormProps = {
  onChange: (rows: CreativeAssetInventoryRow[]) => void;
  rows: CreativeAssetInventoryRow[];
};

export function CreativeAssetInventoryForm({
  onChange,
  rows,
}: CreativeAssetInventoryFormProps) {
  return (
    <Panel className="p-5 md:p-6">
      <PanelHeader
        eyebrow="Six source types"
        title="Replace the starting example with your real counts"
        description="Rights unknown stays separate because an asset can look finished without being cleared for the next use."
      />
      <div className="mt-6 grid gap-4">
        {rows.map((row) => (
          <CreativeAssetInventoryRowEditor
            key={row.id}
            row={row}
            onChange={(nextRow) =>
              onChange(
                rows.map((currentRow) =>
                  currentRow.id === nextRow.id ? nextRow : currentRow,
                ),
              )
            }
          />
        ))}
      </div>
    </Panel>
  );
}
