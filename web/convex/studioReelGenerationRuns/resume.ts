import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertStudioReelBoundedString } from "../studioReel/assertStudioReelBoundedString";
import { assertStudioReelPositiveInteger } from "../studioReel/assertStudioReelPositiveInteger";
import { getStudioReelAuthenticatedScope } from "../studioReel/getStudioReelAuthenticatedScope";
import { studioReelProviderReadinessValidator } from "../validators/studioReelProviderReadiness";
import { restartStudioReelRunIntent } from "./restartIntent";

export const resume = mutation({
  args: {
    id: v.string(),
    productId: v.string(),
    expectedRevision: v.number(),
    providerReadiness: v.array(studioReelProviderReadinessValidator),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    const { ownerId, productId } = await getStudioReelAuthenticatedScope(
      ctx,
      args.productId,
    );
    return await restartStudioReelRunIntent(ctx, {
      ownerId,
      productId,
      runId: assertStudioReelBoundedString(args.id, {
        label: "Generation run ID",
        maxLength: 120,
      }),
      expectedRevision: assertStudioReelPositiveInteger(
        args.expectedRevision,
        "Expected revision",
        Number.MAX_SAFE_INTEGER,
      ),
      idempotencyKey: assertStudioReelBoundedString(args.idempotencyKey, {
        label: "Idempotency key",
        maxLength: 200,
      }),
      operation: "resumeRun",
      allowedStatuses: ["canceled"],
      providerReadiness: args.providerReadiness,
    });
  },
});
