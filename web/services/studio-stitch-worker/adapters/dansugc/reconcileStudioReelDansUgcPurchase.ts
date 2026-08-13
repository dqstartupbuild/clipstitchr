import type { StudioReelCheckpointReactionSelection } from "../../contracts/StudioReelCheckpointReactionSelection";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { assertStudioReelDansUgcPurchaseCoverage } from "./assertStudioReelDansUgcPurchaseCoverage";
import { listStudioReelDansUgcPurchases } from "./listStudioReelDansUgcPurchases";

export async function reconcileStudioReelDansUgcPurchase(input: {
  apiKey: string;
  fetch?: typeof fetch;
  reserveReconciliation: () => Promise<void>;
  selections: readonly StudioReelCheckpointReactionSelection[];
}) {
  await input.reserveReconciliation();
  try {
    return assertStudioReelDansUgcPurchaseCoverage(
      input.selections,
      await listStudioReelDansUgcPurchases({
        apiKey: input.apiKey,
        fetch: input.fetch,
      }),
    );
  } catch (reconciliationError) {
    throw new StudioReelWorkerError({
      cause: reconciliationError,
      code: "DANSUGC_PURCHASE_OUTCOME_UNCERTAIN",
      kind: "uncertain",
      publicMessage: "DanSUGC purchase acceptance could not be reconciled safely.",
    });
  }
}
