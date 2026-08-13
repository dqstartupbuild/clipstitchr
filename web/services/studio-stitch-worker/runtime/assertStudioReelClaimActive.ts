import type { StudioReelWorkerCheckpoint } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerCheckpoint";
import type { StudioReelWorkerClaimEnvelope } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimEnvelope";
import { getStudioReelLeaseState } from "../adapters/http/getStudioReelLeaseState";
import type { StudioReelWorkerHttpClient } from "../contracts/StudioReelWorkerHttpClient";
import { StudioReelWorkerCancellationError } from "../errors/StudioReelWorkerCancellationError";
import { StudioReelWorkerError } from "../errors/StudioReelWorkerError";

export async function assertStudioReelClaimActive(
  input: {
    claim: StudioReelWorkerClaimEnvelope;
    http: StudioReelWorkerHttpClient;
    onStage?: (input: {
      checkpoint: StudioReelWorkerCheckpoint;
      progressPercent?: number;
      recipeIndex: number;
    }) => void;
  },
  checkpoint: StudioReelWorkerCheckpoint,
  recipeIndex: number,
): Promise<void> {
  input.onStage?.({ checkpoint, recipeIndex });
  const state = await getStudioReelLeaseState({
    claim: input.claim,
    http: input.http,
  });
  if (state.cancellationRequested || state.status === "canceled") {
    throw new StudioReelWorkerCancellationError(checkpoint, recipeIndex);
  }
  if (
    state.execution.state === "unavailable" ||
    !state.productOwned ||
    !state.studioAccess
  ) {
    throw new StudioReelWorkerError({
      code: "EXECUTION_ACCESS_REVOKED",
      kind: "permanent",
      publicMessage:
        "Studio Stitch access or Product ownership changed during execution.",
    });
  }
  if (!state.leaseValid) {
    throw new StudioReelWorkerError({
      code: "WORKER_LEASE_REVOKED",
      kind: "retryable",
      publicMessage: "The Studio Stitch worker lease is no longer valid.",
    });
  }
}
