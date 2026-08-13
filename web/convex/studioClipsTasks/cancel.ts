import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioClipsActiveProduct } from "./assertStudioClipsActiveProduct";
import { assertStudioClipsBoundedText } from "./assertStudioClipsBoundedText";
import { assertStudioClipsIdentifier } from "./assertStudioClipsIdentifier";
import { STUDIO_CLIPS_PERSISTENCE_LIMITS } from "./studioClipsPersistenceLimits";
import { writeStudioClipsTaskLifecycle } from "./writeStudioClipsTaskLifecycle";

export const cancel = mutation({
  args: { id: v.string(), idempotencyKey: v.string(), productId: v.string() },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    await assertStudioBetaAccess(ctx, ownerId);
    const productId = assertStudioClipsIdentifier(args.productId, "Product ID");
    await assertStudioClipsActiveProduct(ctx, ownerId, productId);
    return await writeStudioClipsTaskLifecycle(ctx, {
      idempotencyKey: assertStudioClipsBoundedText(args.idempotencyKey, {
        label: "Idempotency key",
        maxLength: STUDIO_CLIPS_PERSISTENCE_LIMITS.idempotencyKeyCharacters,
      }),
      operation: "cancel",
      ownerId,
      productId,
      taskId: assertStudioClipsIdentifier(args.id, "Studio Clips task ID"),
    });
  },
});
