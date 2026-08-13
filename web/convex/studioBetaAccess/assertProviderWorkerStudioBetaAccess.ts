import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { assertStudioBetaAccess } from "./assertStudioBetaAccess";

export const assertProviderWorkerStudioBetaAccess = mutation({
  args: {
    ownerId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { ownerId, secret }) => {
    assertProviderWorkerSecret(secret);
    await assertStudioBetaAccess(ctx, ownerId);

    return true;
  },
});
