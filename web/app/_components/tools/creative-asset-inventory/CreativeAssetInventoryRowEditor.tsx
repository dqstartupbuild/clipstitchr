import { ToolNumberField } from "@/app/_components/tools/ToolNumberField";
import type { CreativeAssetInventoryRow } from "@/lib/clipstitchr/tools/creativeAssetInventory/CreativeAssetInventoryRow";

type CreativeAssetInventoryRowEditorProps = {
  onChange: (row: CreativeAssetInventoryRow) => void;
  row: CreativeAssetInventoryRow;
};

export function CreativeAssetInventoryRowEditor({
  onChange,
  row,
}: CreativeAssetInventoryRowEditorProps) {
  return (
    <fieldset className="rounded-lg border border-border bg-surface-elevated p-4">
      <legend className="px-2 text-sm font-bold text-text-primary">
        {row.assetType}
      </legend>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            ["ready", "Ready", "Usable in the next production round."],
            [
              "needsWork",
              "Needs work",
              "Exists, but needs review or recapture.",
            ],
            ["missing", "Missing", "A known asset you still need."],
            [
              "rightsUnknown",
              "Rights unknown",
              "Usage details are not confirmed.",
            ],
          ] as const
        ).map(([field, label, description]) => (
          <ToolNumberField
            description={description}
            id={`${row.id}-${field}`}
            key={field}
            label={label}
            max={999}
            value={row[field]}
            onChange={(value) => onChange({ ...row, [field]: value })}
          />
        ))}
      </div>
    </fieldset>
  );
}
