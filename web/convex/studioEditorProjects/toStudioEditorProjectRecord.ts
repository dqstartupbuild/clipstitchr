import type { Doc } from "../_generated/dataModel";
import type { StudioEditorProjectRecord } from "../../lib/clipstitchr/types/studioEditor/StudioEditorProjectRecord";

export function toStudioEditorProjectRecord(
  project: Doc<"studioEditorProjects">,
): StudioEditorProjectRecord {
  if (project.snapshotVersion !== 1) {
    throw new Error(
      "Stored Studio editor project uses an unsupported snapshot version.",
    );
  }
  return {
    id: project.id,
    productId: project.productId,
    name: project.name,
    status: project.status,
    revision: project.revision,
    snapshotVersion: 1,
    snapshotJson: project.snapshotJson,
    snapshotByteLength: project.snapshotByteLength,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    ...(project.archivedAt ? { archivedAt: project.archivedAt } : {}),
  };
}
