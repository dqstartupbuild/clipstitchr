import { v } from "convex/values";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { query } from "../_generated/server";

export const getForProvider = query({
  args: {
    id: v.string(),
    ownerId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);

    return await ctx.db
      .query("hookLabPosts")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", args.id.trim()),
      )
      .unique();
  },
});
