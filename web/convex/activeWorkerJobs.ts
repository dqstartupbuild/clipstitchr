import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { getActiveWorkerJobSummary } from "./getActiveWorkerJobSummary";
import { query } from "./_generated/server";

export const summary = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await getActiveWorkerJobSummary(ctx, ownerId);
  },
});
