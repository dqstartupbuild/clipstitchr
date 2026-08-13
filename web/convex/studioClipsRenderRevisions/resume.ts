import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioClipsActiveProduct } from "../studioClipsTasks/assertStudioClipsActiveProduct";
import { assertStudioClipsBoundedText } from "../studioClipsTasks/assertStudioClipsBoundedText";
import { assertStudioClipsIdentifier } from "../studioClipsTasks/assertStudioClipsIdentifier";
import { STUDIO_CLIPS_PERSISTENCE_LIMITS } from "../studioClipsTasks/studioClipsPersistenceLimits";
import { writeStudioClipsRenderRevisionLifecycle } from "./writeLifecycle";

export const resume = mutation({
  args: { id: v.string(), idempotencyKey: v.string(), productId: v.string() },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    await assertStudioBetaAccess(ctx, ownerId);
    const productId = assertStudioClipsIdentifier(args.productId, "Product ID");
    await assertStudioClipsActiveProduct(ctx, ownerId, productId);
    return await writeStudioClipsRenderRevisionLifecycle(ctx, {
      id: assertStudioClipsIdentifier(args.id, "Render revision ID"),
      idempotencyKey: assertStudioClipsBoundedText(args.idempotencyKey, {
        label: "Idempotency key",
        maxLength: STUDIO_CLIPS_PERSISTENCE_LIMITS.idempotencyKeyCharacters,
      }),
      operation: "render_revision_resume",
      ownerId,
      productId,
    });
  },
});
