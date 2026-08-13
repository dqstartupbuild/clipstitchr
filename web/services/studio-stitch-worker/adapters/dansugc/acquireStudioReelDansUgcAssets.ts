import { join } from "node:path";
import type { StudioStitchRecipeV1 } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchRecipeV1";
import type { StudioReelWorkerClaimEnvelope } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimEnvelope";
import { STUDIO_REEL_WORKER_LIMITS } from "../../constants/studioReelWorkerLimits";
import type { StudioReelCheckpointReactionSelection } from "../../contracts/StudioReelCheckpointReactionSelection";
import type { StudioReelCommandRunner } from "../../contracts/StudioReelCommandRunner";
import type { StudioReelReactionAcquisition } from "../../contracts/StudioReelReactionAcquisition";
import type { StudioReelWorkerCostReservation } from "../../contracts/StudioReelWorkerCostReservation";
import type { StudioReelWorkerR2ObjectStore } from "../../contracts/StudioReelWorkerR2ObjectStore";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { getStudioReelReactionObjectKey } from "../../runtime/getStudioReelReactionObjectKey";
import { getStudioReelReactionRequiredEnd } from "../../runtime/getStudioReelReactionRequiredEnd";
import { probeStudioReelMedia } from "../media/probeStudioReelMedia";
import { downloadStudioReelDansUgcVideo } from "./downloadStudioReelDansUgcVideo";
import { purchaseStudioReelDansUgcVideos } from "./purchaseStudioReelDansUgcVideos";
import { reserveStudioReelDansUgcReconciliation } from "./reserveStudioReelDansUgcReconciliation";

export async function acquireStudioReelDansUgcAssets(input: {
  readonly allowedDownloadHosts: readonly string[];
  readonly apiKey: string;
  readonly assertActive: () => Promise<void>;
  readonly claim: StudioReelWorkerClaimEnvelope;
  readonly fetch?: typeof fetch;
  readonly ffprobePath: string;
  readonly objects: StudioReelWorkerR2ObjectStore;
  readonly recipe: StudioStitchRecipeV1;
  readonly reserve: (
    invocationId: string,
  ) => Promise<StudioReelWorkerCostReservation>;
  readonly runner: StudioReelCommandRunner;
  readonly selections: readonly StudioReelCheckpointReactionSelection[];
  readonly workspacePath: string;
}): Promise<StudioReelReactionAcquisition> {
  await input.assertActive();
  const purchaseReservation = await input.reserve(
    `${input.recipe.id}_dansugc_purchase_${input.claim.runAttempt}`,
  );
  await input.assertActive();
  const purchases = await purchaseStudioReelDansUgcVideos({
    apiKey: input.apiKey,
    fetch: input.fetch,
    purchaseAlreadyReserved: purchaseReservation.alreadyReserved,
    reserveReconciliation: reserveStudioReelDansUgcReconciliation.bind(null, {
      assertActive: input.assertActive,
      invocationId: `${input.recipe.id}_dansugc_reconcile_${input.claim.runAttempt}`,
      reserve: input.reserve,
    }),
    selections: input.selections,
  });
  const assets = [];
  const checkpointAssets = [];
  for (let index = 0; index < input.selections.length; index += 1) {
    const selection = input.selections[index];
    const purchase = purchases[index];
    const localPath = join(
      input.workspacePath,
      `dansugc-${String(index + 1).padStart(3, "0")}.mp4`,
    );
    await input.assertActive();
    await input.reserve(
      `${input.recipe.id}_dansugc_download_${input.claim.runAttempt}_${index + 1}`,
    );
    await input.assertActive();
    const sizeBytes = await downloadStudioReelDansUgcVideo({
      allowedHosts: input.allowedDownloadHosts,
      downloadUrl: purchase.downloadUrl,
      fetch: input.fetch,
      maximumBytes: STUDIO_REEL_WORKER_LIMITS.reactionBytes,
      outputPath: localPath,
    });
    const probe = await probeStudioReelMedia({
      ffprobePath: input.ffprobePath,
      localPath,
      runner: input.runner,
      workspacePath: input.workspacePath,
    });
    if (
      probe.sizeBytes !== sizeBytes ||
      probe.durationSeconds + 0.05 <
        getStudioReelReactionRequiredEnd(input.recipe, selection.source)
    ) {
      throw new StudioReelWorkerError({
        code: "DANSUGC_REACTION_MEDIA_INVALID",
        kind: "permanent",
        publicMessage:
          "A purchased DanSUGC reaction does not cover its frozen segment.",
      });
    }
    await input.assertActive();
    const proof = await input.objects.putFileVerified({
      contentType: "video/mp4",
      localPath,
      maximumBytes: STUDIO_REEL_WORKER_LIMITS.reactionBytes,
      objectKey: getStudioReelReactionObjectKey({
        index,
        ownerId: input.claim.ownerId,
        productId: input.claim.productId,
        recipeId: input.recipe.id,
        runAttempt: input.claim.runAttempt,
        runId: input.claim.runId,
        videoId: selection.videoId,
      }),
      ownerId: input.claim.ownerId,
      sizeBytes,
    });
    const manifest = {
      contentType: "video/mp4" as const,
      durationSeconds: probe.durationSeconds,
      hasAudio: probe.hasAudio,
      height: probe.height,
      objectKey: proof.objectKey,
      objectVersion: proof.objectVersion,
      sha256: proof.sha256Hex,
      sizeBytes,
      source: selection.source,
      width: probe.width,
    };
    assets.push({ localPath, manifest });
    checkpointAssets.push({
      ...manifest,
      currency: purchase.currency,
      modelId: selection.modelId,
      pricePaid: purchase.pricePaid,
      purchasedAt: purchase.purchasedAt,
      recipeId: input.recipe.id,
      videoId: selection.videoId,
    });
  }
  return { assets, checkpointAssets };
}
