import type { StudioEditorProjectV1 } from "../../types/studioEditor/StudioEditorProjectV1";
import { assertStudioEditorProjectV1 } from "./assertStudioEditorProjectV1";

export function parseStudioEditorProjectSnapshot(
  snapshotJson: string,
): StudioEditorProjectV1 {
  let parsed: unknown;
  try {
    parsed = JSON.parse(snapshotJson) as unknown;
  } catch {
    throw new Error("Studio editor snapshot must be valid JSON.");
  }
  assertStudioEditorProjectV1(parsed);
  return parsed;
}
