import type { StudioReelWorkerCheckpoint } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerCheckpoint";
import type { StudioReelWorkerClaimEnvelope } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimEnvelope";
import type { StudioReelWorkerHttpClient } from "../../contracts/StudioReelWorkerHttpClient";

export async function publishStudioReelProgress(input: {
  checkpoint: StudioReelWorkerCheckpoint;
  claim: StudioReelWorkerClaimEnvelope;
  code:
    | "worker_started"
    | "sources_acquired"
    | "gemini_ready"
    | "voice_ready"
    | "rendered"
    | "output_stored"
    | "completed"
    | "cancelled"
    | "failed";
  http: StudioReelWorkerHttpClient;
  progressPercent: number;
  recipeIndex: number;
  state: "processing" | "cancelled" | "failed" | "completed";
}) {
  const recipe = input.claim.recipes[input.recipeIndex];
  return input.http.post("/api/studio/stitch/worker/progress", {
    checkpoint: input.checkpoint,
    code: input.code,
    leaseAttempt: input.claim.leaseAttempt,
    leaseId: input.claim.leaseId,
    occurredAt: new Date().toISOString(),
    ownerId: input.claim.ownerId,
    productId: input.claim.productId,
    progressPercent: input.progressPercent,
    ...(recipe ? { recipeId: recipe.id } : {}),
    recipeIndex: input.recipeIndex,
    runAttempt: input.claim.runAttempt,
    runId: input.claim.runId,
    state: input.state,
  });
}
