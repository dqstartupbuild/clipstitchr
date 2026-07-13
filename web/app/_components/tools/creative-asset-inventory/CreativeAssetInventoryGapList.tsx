import type { CreativeAssetInventoryGap } from "@/lib/clipstitchr/tools/creativeAssetInventory/CreativeAssetInventoryGap";

type CreativeAssetInventoryGapListProps = {
  gaps: readonly CreativeAssetInventoryGap[];
};

export function CreativeAssetInventoryGapList({
  gaps,
}: CreativeAssetInventoryGapListProps) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-text-primary">
        Prioritized captures and fixes
      </h3>
      {gaps.length > 0 ? (
        <ol className="mt-3 grid gap-3">
          {gaps.map((gap, index) => (
            <li
              className="rounded-lg border border-border bg-surface-elevated p-4"
              key={gap.assetType}
            >
              <p className="text-sm font-bold text-text-primary">
                {index + 1}. {gap.assetType}
              </p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                {gap.nextAction}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Every counted asset is marked ready. Recheck the counts before the
          next production round.
        </p>
      )}
    </div>
  );
}
