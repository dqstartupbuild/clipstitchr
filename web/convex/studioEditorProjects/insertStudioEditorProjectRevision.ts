import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function insertStudioEditorProjectRevision(
  ctx: MutationCtx,
  input: {
    createdAt: string;
    name: string;
    operation: Doc<"studioEditorProjectWriteReceipts">["operation"];
    ownerId: string;
    productId: string;
    projectId: string;
    revision: number;
    snapshotByteLength: number;
    snapshotJson: string;
    snapshotVersion: number;
    status: Doc<"studioEditorProjects">["status"];
  },
) {
  await ctx.db.insert("studioEditorProjectRevisions", {
    ...input,
    recordVersion: 1,
  });
}
