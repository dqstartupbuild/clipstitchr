import type { Doc } from "../_generated/dataModel";
import type { StudioEditorProjectSummary } from "../../lib/clipstitchr/types/studioEditor/StudioEditorProjectSummary";

export function toStudioEditorProjectSummary(
  project: Doc<"studioEditorProjects">,
): StudioEditorProjectSummary {
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
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    ...(project.archivedAt ? { archivedAt: project.archivedAt } : {}),
  };
}
