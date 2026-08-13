import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertMediaWorkerSecret } from "../auth/assertMediaWorkerSecret";
import { assertStudioBetaAccess } from "./assertStudioBetaAccess";

export const assertMediaWorkerStudioBetaAccess = mutation({
  args: {
    ownerId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { ownerId, secret }) => {
    assertMediaWorkerSecret(secret);
    await assertStudioBetaAccess(ctx, ownerId);

    return true;
  },
});
