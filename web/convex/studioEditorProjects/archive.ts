import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioEditorActiveProduct } from "./assertStudioEditorActiveProduct";
import { assertStudioEditorBoundedString } from "./assertStudioEditorBoundedString";
import { assertStudioEditorRevision } from "./assertStudioEditorRevision";
import { changeStudioEditorProjectStatus } from "./changeStudioEditorProjectStatus";

export const archive = mutation({
  args: {
    id: v.string(),
    productId: v.string(),
    expectedRevision: v.number(),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const productId = assertStudioEditorBoundedString(args.productId, {
      label: "Product ID",
      maxLength: 120,
    });
    await assertStudioBetaAccess(ctx, ownerId);
    await assertStudioEditorActiveProduct(ctx, ownerId, productId);
    return await changeStudioEditorProjectStatus(ctx, {
      ownerId,
      productId,
      projectId: assertStudioEditorBoundedString(args.id, {
        label: "Studio editor project ID",
        maxLength: 120,
      }),
      expectedRevision: assertStudioEditorRevision(args.expectedRevision),
      idempotencyKey: assertStudioEditorBoundedString(args.idempotencyKey, {
        label: "Idempotency key",
        maxLength: 200,
      }),
      operation: "archive",
      fromStatus: "active",
      toStatus: "archived",
    });
  },
});
