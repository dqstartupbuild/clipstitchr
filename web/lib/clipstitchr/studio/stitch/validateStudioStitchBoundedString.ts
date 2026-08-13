import type { StudioStitchValidationIssue } from "../../types/studioStitch/StudioStitchValidationIssue";
import { addStudioStitchValidationIssue } from "./addStudioStitchValidationIssue";

export function validateStudioStitchBoundedString(
  issues: StudioStitchValidationIssue[],
  candidate: unknown,
  path: string,
  maximum = 2_000,
): candidate is string {
  if (
    typeof candidate !== "string" ||
    candidate.trim().length === 0 ||
    candidate.length > maximum
  ) {
    addStudioStitchValidationIssue(
      issues,
      path,
      "invalid_string",
      `Expected a non-empty string up to ${maximum} characters.`,
    );
    return false;
  }
  return true;
}
