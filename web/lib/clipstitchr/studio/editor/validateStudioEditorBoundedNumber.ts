import type { StudioEditorValidationIssue } from "../../types/studioEditor/StudioEditorValidationIssue";
import { addStudioEditorValidationIssue } from "./addStudioEditorValidationIssue";
import { isFiniteStudioEditorNumber } from "./isFiniteStudioEditorNumber";

export function validateStudioEditorBoundedNumber(
  issues: StudioEditorValidationIssue[],
  candidate: unknown,
  path: string,
  minimum: number,
  maximum: number,
): candidate is number {
  if (
    !isFiniteStudioEditorNumber(candidate) ||
    candidate < minimum ||
    candidate > maximum
  ) {
    addStudioEditorValidationIssue(
      issues,
      path,
      "invalid_number",
      `Expected a finite number from ${minimum} through ${maximum}.`,
    );
    return false;
  }
  return true;
}
