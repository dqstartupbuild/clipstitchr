import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { query } from "../_generated/server";
import { getHookLabCreativeBriefForOwner } from "./getHookLabCreativeBriefForOwner";

export const get = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await getHookLabCreativeBriefForOwner(ctx, ownerId, id);
  },
});
