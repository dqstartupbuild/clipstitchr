import type { StudioEditorProjectV1 } from "../../types/studioEditor/StudioEditorProjectV1";
import { assertStudioEditorProjectV1 } from "./assertStudioEditorProjectV1";

export function serializeStudioEditorProjectSnapshot(
  project: StudioEditorProjectV1,
) {
  assertStudioEditorProjectV1(project);
  return JSON.stringify(project);
}
