import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { getStudioBetaAccessStateForOwner } from "./getStudioBetaAccessStateForOwner";

export const getCurrentStudioBetaAccessState = query({
  args: {},
  handler: async (ctx) =>
    await getStudioBetaAccessStateForOwner(
      ctx,
      await getAuthenticatedOwnerId(ctx),
    ),
});
