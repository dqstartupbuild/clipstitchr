import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { assertOwnerCanPublishSocial } from "../billing/assertOwnerCanPublishSocial";

export const assertSocialPublishBillingForProvider = query({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    now: v.string(),
  },
  handler: async (ctx, { secret, ownerId, now }) => {
    assertProviderWorkerSecret(secret);
    await assertOwnerCanPublishSocial(ctx, ownerId, now);
    return true;
  },
});
