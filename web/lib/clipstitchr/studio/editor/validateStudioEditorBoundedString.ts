import type { StudioEditorValidationIssue } from "../../types/studioEditor/StudioEditorValidationIssue";
import { addStudioEditorValidationIssue } from "./addStudioEditorValidationIssue";

export function validateStudioEditorBoundedString(
  issues: StudioEditorValidationIssue[],
  candidate: unknown,
  path: string,
  maximum = 200,
): candidate is string {
  if (
    typeof candidate !== "string" ||
    candidate.trim().length === 0 ||
    candidate.length > maximum
  ) {
    addStudioEditorValidationIssue(
      issues,
      path,
      "invalid_string",
      `Expected a non-empty string up to ${maximum} characters.`,
    );
    return false;
  }
  return true;
}
