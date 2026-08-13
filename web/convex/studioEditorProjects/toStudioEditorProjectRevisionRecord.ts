import type { Doc } from "../_generated/dataModel";
import type { StudioEditorProjectRevisionRecord } from "../../lib/clipstitchr/types/studioEditor/StudioEditorProjectRevisionRecord";

export function toStudioEditorProjectRevisionRecord(
  revision: Doc<"studioEditorProjectRevisions">,
): StudioEditorProjectRevisionRecord {
  return {
    createdAt: revision.createdAt,
    name: revision.name,
    operation: revision.operation,
    productId: revision.productId,
    projectId: revision.projectId,
    revision: revision.revision,
    snapshotByteLength: revision.snapshotByteLength,
    snapshotJson: revision.snapshotJson,
    snapshotVersion: 1,
    status: revision.status,
  };
}
