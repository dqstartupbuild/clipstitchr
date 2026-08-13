import { getStudioEditorUtf8ByteLength } from "../../lib/clipstitchr/studio/editor/getStudioEditorUtf8ByteLength";
import { parseStudioEditorProjectSnapshot } from "../../lib/clipstitchr/studio/editor/parseStudioEditorProjectSnapshot";
import { serializeStudioEditorProjectSnapshot } from "../../lib/clipstitchr/studio/editor/serializeStudioEditorProjectSnapshot";
import { STUDIO_EDITOR_PROJECT_SNAPSHOT_MAX_BYTES } from "../../lib/clipstitchr/studio/editor/studioEditorProjectSnapshotMaxBytes";
import { assertStudioEditorProjectUploadScope } from "./assertStudioEditorProjectUploadScope";

export function normalizeStudioEditorProjectSnapshot(
  snapshotJson: string,
  expected: { id: string; ownerId: string; productId: string; name?: string },
) {
  if (
    getStudioEditorUtf8ByteLength(snapshotJson) >
    STUDIO_EDITOR_PROJECT_SNAPSHOT_MAX_BYTES
  ) {
    throw new Error(
      `Studio editor snapshot exceeds its ${STUDIO_EDITOR_PROJECT_SNAPSHOT_MAX_BYTES}-byte cap.`,
    );
  }
  const project = parseStudioEditorProjectSnapshot(snapshotJson);
  if (project.id !== expected.id || project.productId !== expected.productId) {
    throw new Error(
      "Studio editor snapshot identity does not match the requested project and Product.",
    );
  }
  if (expected.name !== undefined && project.name !== expected.name) {
    throw new Error(
      "Studio editor snapshot name does not match the requested project name.",
    );
  }
  assertStudioEditorProjectUploadScope(
    project,
    expected.ownerId,
    expected.productId,
  );
  const normalizedJson = serializeStudioEditorProjectSnapshot(project);
  const byteLength = getStudioEditorUtf8ByteLength(normalizedJson);
  if (byteLength > STUDIO_EDITOR_PROJECT_SNAPSHOT_MAX_BYTES) {
    throw new Error(
      `Studio editor snapshot exceeds its ${STUDIO_EDITOR_PROJECT_SNAPSHOT_MAX_BYTES}-byte cap.`,
    );
  }
  return { project, snapshotJson: normalizedJson, byteLength };
}
