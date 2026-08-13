import { v } from "convex/values";
import { query } from "../_generated/server";
import { getStudioBetaAccessStateForOwner } from "../studioBetaAccess/getStudioBetaAccessStateForOwner";
import { assertStudioClipsWorkerSecret } from "./assertStudioClipsWorkerSecret";
import { getStudioClipsProductIsOwnedActive } from "./getStudioClipsProductIsOwnedActive";
import { getStudioClipsWorkerTask } from "./getStudioClipsWorkerTask";

export const getLeaseState = query({
  args: {
    attempt: v.number(),
    leaseId: v.string(),
    ownerId: v.string(),
    productId: v.string(),
    secret: v.string(),
    taskId: v.string(),
  },
  handler: async (ctx, args) => {
    assertStudioClipsWorkerSecret(args.secret);
    const task = await getStudioClipsWorkerTask(ctx, args);
    const [access, productOwned] = await Promise.all([
      getStudioBetaAccessStateForOwner(ctx, args.ownerId),
      getStudioClipsProductIsOwnedActive(ctx, args.ownerId, args.productId),
    ]);
    const leaseValid = Boolean(
      task &&
        task.status === "processing" &&
        task.attempt === args.attempt &&
        task.leaseId === args.leaseId &&
        task.leaseExpiresAt &&
        Date.parse(task.leaseExpiresAt) > Date.now(),
    );
    return {
      cancellationRequested: Boolean(task?.cancelRequestedAt),
      leaseValid,
      productOwned,
      status: task?.status ?? null,
      studioAccess: access.hasAccess,
      taskFound: Boolean(task),
    };
  },
});
