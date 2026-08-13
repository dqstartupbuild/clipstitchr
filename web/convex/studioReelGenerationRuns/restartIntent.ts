import type { MutationCtx } from "../_generated/server";
import type { Infer } from "convex/values";
import { studioReelProviderReadinessValidator } from "../validators/studioReelProviderReadiness";
import { studioReelRunStatusValidator } from "../validators/studioReelRunStatus";
import { studioReelWriteOperationValidator } from "../validators/studioReelWriteOperation";
import { assertStudioReelMatchingWriteReceipt } from "../studioReel/assertStudioReelMatchingWriteReceipt";
import { buildStudioReelProviderIntents } from "../studioReel/buildStudioReelProviderIntents";
import { consumeStudioReelProviderIntentListRateLimits } from "../studioReel/consumeStudioReelProviderIntentListRateLimits";
import { consumeStudioReelRecordWriteRateLimits } from "../studioReel/consumeStudioReelRecordWriteRateLimits";
import { createStudioReelRequestFingerprint } from "../studioReel/createStudioReelRequestFingerprint";
import { createStudioReelWriteReceipt } from "../studioReel/createStudioReelWriteReceipt";
import { getStudioReelRecipesForOwnerProduct } from "../studioReel/getStudioReelRecipesForOwnerProduct";
import { getStudioReelRunForOwnerProduct } from "../studioReel/getStudioReelRunForOwnerProduct";
import { getStudioReelRunStatusFromIntents } from "../studioReel/getStudioReelRunStatusFromIntents";
import { getStudioReelWriteReceipt } from "../studioReel/getStudioReelWriteReceipt";
import { normalizeStudioReelProviderReadiness } from "../studioReel/normalizeStudioReelProviderReadiness";
import { parseStudioReelRecipeDocuments } from "../studioReel/parseStudioReelRecipeDocuments";

type ProviderReadiness = Infer<typeof studioReelProviderReadinessValidator>;
type RunStatus = Infer<typeof studioReelRunStatusValidator>;
type WriteOperation = Infer<typeof studioReelWriteOperationValidator>;

export async function restartStudioReelRunIntent(
  ctx: MutationCtx,
  args: {
    readonly ownerId: string;
    readonly productId: string;
    readonly runId: string;
    readonly expectedRevision: number;
    readonly idempotencyKey: string;
    readonly operation: WriteOperation;
    readonly allowedStatuses: readonly RunStatus[];
    readonly providerReadiness: readonly ProviderReadiness[];
  },
) {
  const providerReadiness = normalizeStudioReelProviderReadiness(
    args.providerReadiness,
  );
  const requestFingerprint = await createStudioReelRequestFingerprint(
    JSON.stringify({
      operation: args.operation,
      productId: args.productId,
      runId: args.runId,
      expectedRevision: args.expectedRevision,
      providerReadiness,
    }),
  );
  const receipt = await getStudioReelWriteReceipt(
    ctx,
    args.ownerId,
    args.idempotencyKey,
  );
  if (receipt) {
    assertStudioReelMatchingWriteReceipt(receipt, {
      productId: args.productId,
      operation: args.operation,
      requestFingerprint,
    });
    const run = await getStudioReelRunForOwnerProduct(
      ctx,
      args.ownerId,
      args.productId,
      receipt.targetId,
    );
    if (!run) throw new Error("Idempotent generation run is unavailable.");
    return { changed: false, run };
  }
  const run = await getStudioReelRunForOwnerProduct(
    ctx,
    args.ownerId,
    args.productId,
    args.runId,
  );
  if (!run) throw new Error("Generation run not found.");
  if (run.revision !== args.expectedRevision) {
    throw new Error(
      `Generation run revision conflict: expected ${args.expectedRevision}, current ${run.revision}.`,
    );
  }
  if (!args.allowedStatuses.includes(run.status)) {
    throw new Error("Generation run cannot restart from its current state.");
  }
  if (run.status === "failed" && run.failureRetryable === false) {
    throw new Error("This generation failure is not retryable.");
  }
  const recipeDocuments = await getStudioReelRecipesForOwnerProduct(
    ctx,
    args.ownerId,
    args.productId,
    run.recipeIds,
  );
  const providerIntents = buildStudioReelProviderIntents(
    parseStudioReelRecipeDocuments(recipeDocuments),
    providerReadiness,
  );

  await consumeStudioReelRecordWriteRateLimits(ctx, args.ownerId);
  await consumeStudioReelProviderIntentListRateLimits(
    ctx,
    args.ownerId,
    providerIntents,
  );
  const now = new Date().toISOString();
  const fields = {
    status: getStudioReelRunStatusFromIntents(providerIntents),
    revision: run.revision + 1,
    providerReadiness,
    providerIntents,
    attempt: run.attempt + 1,
    workerLeaseAttempt: undefined,
    workerLeaseId: undefined,
    workerLeaseWorkerId: undefined,
    workerLeaseExpiresAt: undefined,
    executionProgressPercent: undefined,
    executionCheckpoint: undefined,
    executionRecipeIndex: undefined,
    executionCode: undefined,
    resumeRevision: undefined,
    cancelRequestedAt: undefined,
    startedAt: undefined,
    canceledAt: undefined,
    failedAt: undefined,
    failureCode: undefined,
    failureMessage: undefined,
    failureRetryable: undefined,
    failureKind: undefined,
    updatedAt: now,
  };
  await ctx.db.patch(run._id, fields);
  await createStudioReelWriteReceipt(ctx, {
    ownerId: args.ownerId,
    productId: args.productId,
    idempotencyKey: args.idempotencyKey,
    operation: args.operation,
    targetId: args.runId,
    requestFingerprint,
    createdAt: now,
  });
  return { changed: true, run: { ...run, ...fields } };
}
