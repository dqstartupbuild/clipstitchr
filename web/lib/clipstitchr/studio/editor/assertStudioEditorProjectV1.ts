import type { StudioEditorProjectV1 } from "../../types/studioEditor/StudioEditorProjectV1";
import { validateStudioEditorProjectV1 } from "./validateStudioEditorProjectV1";

export function assertStudioEditorProjectV1(
  value: unknown,
): asserts value is StudioEditorProjectV1 {
  const issues = validateStudioEditorProjectV1(value);
  if (issues.length > 0) {
    const first = issues[0];
    throw new Error(
      `Invalid Studio editor project at ${first.path}: ${first.message}`,
    );
  }
}
