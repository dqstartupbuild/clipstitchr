import type { StudioEditorHistoryState } from "../../types/studioEditor/StudioEditorHistoryState";
import type { StudioEditorProjectV1 } from "../../types/studioEditor/StudioEditorProjectV1";
import { assertStudioEditorProjectV1 } from "./assertStudioEditorProjectV1";

export function createStudioEditorHistoryState(
  project: StudioEditorProjectV1,
  limit = 100,
): StudioEditorHistoryState {
  assertStudioEditorProjectV1(project);
  if (!Number.isInteger(limit) || limit < 1 || limit > 1_000) {
    throw new Error(
      "Studio editor history limit must be a whole number from 1 through 1,000.",
    );
  }
  return { past: [], present: project, future: [], limit };
}
