import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { query } from "../_generated/server";
import { getStitchRecipeByIdeaOrTemplate } from "../getStitchRecipeByIdeaOrTemplate";

export const get = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await getStitchRecipeByIdeaOrTemplate(ctx, ownerId, id);
  },
});
