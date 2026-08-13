import type { StudioReelCheckpointReactionSelection } from "../../contracts/StudioReelCheckpointReactionSelection";
import type { StudioReelDansUgcPurchase } from "../../contracts/StudioReelDansUgcPurchase";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";

export function assertStudioReelDansUgcPurchaseCoverage(
  selections: readonly StudioReelCheckpointReactionSelection[],
  purchases: readonly StudioReelDansUgcPurchase[],
) {
  if (
    new Set(purchases.map((purchase) => purchase.videoId)).size !==
      purchases.length ||
    selections.some(
      (selection) =>
        !purchases.some((purchase) => purchase.videoId === selection.videoId),
    )
  ) {
    throw new StudioReelWorkerError({
      code: "DANSUGC_PURCHASE_COVERAGE_INVALID",
      kind: "permanent",
      publicMessage: "DanSUGC did not return every selected reaction clip.",
    });
  }
  return selections.map(
    (selection) =>
      purchases.find(
        (purchase) => purchase.videoId === selection.videoId,
      ) as StudioReelDansUgcPurchase,
  );
}
