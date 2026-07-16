import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { getProductAccessStateForOwner } from "./getProductAccessStateForOwner";

export const getProductAccessState = query({
  args: {},
  handler: async (ctx) =>
    await getProductAccessStateForOwner(
      ctx,
      await getAuthenticatedOwnerId(ctx),
      new Date().toISOString(),
    ),
});
