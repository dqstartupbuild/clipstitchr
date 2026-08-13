import type { MutationCtx } from "../_generated/server";
import { getStudioEditorProjectForOwnerProduct } from "../studioEditorProjects/getStudioEditorProjectForOwnerProduct";

export async function assertStudioReelHandoffOwnership(
  ctx: MutationCtx,
  args: {
    readonly ownerId: string;
    readonly productId: string;
    readonly libraryAssetId: string | null;
    readonly editorProjectId: string | null;
  },
) {
  if (args.libraryAssetId !== null) {
    const asset = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (query) =>
        query.eq("ownerId", args.ownerId).eq("id", args.libraryAssetId!),
      )
      .unique();
    if (!asset || asset.productId !== args.productId) {
      throw new Error("Library handoff asset is not owned by this Product.");
    }
  }
  if (args.editorProjectId !== null) {
    const project = await getStudioEditorProjectForOwnerProduct(
      ctx,
      args.ownerId,
      args.productId,
      args.editorProjectId,
    );
    if (!project) {
      throw new Error("Editor handoff project is not owned by this Product.");
    }
  }
}
