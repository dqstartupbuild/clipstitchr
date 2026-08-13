import type { MutationCtx } from "../_generated/server";
import { getActiveStudioClipsTaskForOwnerProduct } from "../studioClipsTasks/getActiveStudioClipsTaskForOwnerProduct";
import { getActiveStudioClipsRenderRevision } from "./getActiveStudioClipsRenderRevision";

export async function getStudioClipsProductHasActiveWork(
  ctx: MutationCtx,
  input: {
    excludeRenderRevisionId?: string;
    excludeTaskId?: string;
    ownerId: string;
    productId: string;
  },
) {
  const [task, renderRevision] = await Promise.all([
    getActiveStudioClipsTaskForOwnerProduct(ctx, {
      excludeTaskId: input.excludeTaskId,
      ownerId: input.ownerId,
      productId: input.productId,
    }),
    getActiveStudioClipsRenderRevision(ctx, {
      excludeId: input.excludeRenderRevisionId,
      ownerId: input.ownerId,
      productId: input.productId,
    }),
  ]);
  return Boolean(task || renderRevision);
}
