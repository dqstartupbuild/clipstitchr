import { claimStudioReelRun } from "../adapters/http/claimStudioReelRun";
import { completeStudioReelRun } from "../adapters/http/completeStudioReelRun";
import { failStudioReelRun } from "../adapters/http/failStudioReelRun";
import { publishStudioReelProgress } from "../adapters/http/publishStudioReelProgress";
import { runBoundedStudioReelCommand } from "../adapters/process/runBoundedStudioReelCommand";
import type { StudioReelCommandRunner } from "../contracts/StudioReelCommandRunner";
import type { StudioReelWorkerClaimResult } from "../contracts/StudioReelWorkerClaimResult";
import type { StudioReelWorkerHttpClient } from "../contracts/StudioReelWorkerHttpClient";
import type { StudioReelWorkerProgressState } from "../contracts/StudioReelWorkerProgressState";
import type { StudioReelWorkerR2ObjectStore } from "../contracts/StudioReelWorkerR2ObjectStore";
import type { StudioReelWorkerRuntimeConfig } from "../contracts/StudioReelWorkerRuntimeConfig";
import { StudioReelWorkerCancellationError } from "../errors/StudioReelWorkerCancellationError";
import { classifyStudioReelWorkerFailure } from "../errors/classifyStudioReelWorkerFailure";
import { processStudioReelClaim } from "../processStudioReelClaim";
import { createStudioReelClaimProcessorDependencies } from "./createStudioReelClaimProcessorDependencies";
import { updateStudioReelWorkerProgressState } from "./updateStudioReelWorkerProgressState";

export async function runStudioReelWorkerOnce(input: {
  config: StudioReelWorkerRuntimeConfig;
  fetch?: typeof fetch;
  http: StudioReelWorkerHttpClient;
  objects: StudioReelWorkerR2ObjectStore;
  runner?: StudioReelCommandRunner;
}): Promise<StudioReelWorkerClaimResult> {
  const claimed = await claimStudioReelRun({
    http: input.http,
    leaseSeconds: input.config.leaseSeconds,
    workerId: input.config.workerId,
  });
  if (!claimed.claim) {
    return { availability: claimed.availability, state: "idle" };
  }
  const claim = claimed.claim;
  const progress: StudioReelWorkerProgressState = {
    checkpoint: claim.resume?.checkpoint ?? "claim_validated",
    progressPercent: 0,
    recipeIndex: claim.resume?.recipeIndex ?? 0,
  };
  try {
    const outputs = await processStudioReelClaim(
      claim,
      createStudioReelClaimProcessorDependencies({
        claim,
        config: input.config,
        fetch: input.fetch,
        http: input.http,
        objects: input.objects,
        onStage: updateStudioReelWorkerProgressState.bind(null, progress),
        runner: input.runner ?? runBoundedStudioReelCommand,
      }),
    );
    await publishStudioReelProgress({
      checkpoint: "completed",
      claim,
      code: "completed",
      http: input.http,
      progressPercent: 100,
      recipeIndex: claim.recipes.length - 1,
      state: "completed",
    });
    await completeStudioReelRun({ claim, http: input.http, outputs });
    return {
      availability: claimed.availability,
      runId: claim.runId,
      state: "completed",
    };
  } catch (error) {
    if (error instanceof StudioReelWorkerCancellationError) {
      await publishStudioReelProgress({
        checkpoint: error.checkpoint,
        claim,
        code: "cancelled",
        http: input.http,
        progressPercent: progress.progressPercent,
        recipeIndex: error.recipeIndex,
        state: "cancelled",
      });
      return {
        availability: claimed.availability,
        runId: claim.runId,
        state: "cancelled",
      };
    }
    const failure = classifyStudioReelWorkerFailure(error, claim.runAttempt);
    try {
      await failStudioReelRun({
        checkpoint: progress.checkpoint,
        claim,
        failure,
        http: input.http,
        recipeIndex: progress.recipeIndex,
      });
    } catch {
      // A revoked/expired lease cannot be mutated by the former worker.
    }
    return {
      availability: claimed.availability,
      runId: claim.runId,
      state: "failed",
    };
  }
}
