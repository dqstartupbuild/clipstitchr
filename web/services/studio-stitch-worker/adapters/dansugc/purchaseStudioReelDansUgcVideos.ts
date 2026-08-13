import type { StudioReelCheckpointReactionSelection } from "../../contracts/StudioReelCheckpointReactionSelection";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { readStudioReelProviderJson } from "../providers/readStudioReelProviderJson";
import { assertStudioReelDansUgcPurchaseCoverage } from "./assertStudioReelDansUgcPurchaseCoverage";
import { fetchStudioReelDansUgc } from "./fetchStudioReelDansUgc";
import { readStudioReelDansUgcPurchases } from "./readStudioReelDansUgcPurchases";
import { reconcileStudioReelDansUgcPurchase } from "./reconcileStudioReelDansUgcPurchase";

export async function purchaseStudioReelDansUgcVideos(input: {
  readonly apiKey: string;
  readonly fetch?: typeof fetch;
  readonly purchaseAlreadyReserved: boolean;
  readonly reserveReconciliation: () => Promise<void>;
  readonly selections: readonly StudioReelCheckpointReactionSelection[];
}) {
  if (input.purchaseAlreadyReserved) {
    return await reconcileStudioReelDansUgcPurchase(input);
  }
  try {
    const response = await fetchStudioReelDansUgc({
      apiKey: input.apiKey,
      fetch: input.fetch,
      init: {
        body: JSON.stringify({
          video_ids: input.selections.map((selection) => selection.videoId),
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      },
      outcomeUnknownOnFailure: true,
      path: "/broll/purchase",
    });
    return assertStudioReelDansUgcPurchaseCoverage(
      input.selections,
      readStudioReelDansUgcPurchases(
        await readStudioReelProviderJson(
          response,
          "DanSUGC",
          2 * 1024 * 1024,
        ),
      ),
    );
  } catch (error) {
    if (
      !(error instanceof StudioReelWorkerError) ||
      ![
        "DANSUGC_OUTCOME_UNKNOWN",
        "DANSUGC_PURCHASE_RESPONSE_INVALID",
        "DANSUGC_PURCHASE_COVERAGE_INVALID",
        "INVALID_PROVIDER_JSON",
      ].includes(error.code)
    ) {
      throw error;
    }
    return await reconcileStudioReelDansUgcPurchase(input);
  }
}
