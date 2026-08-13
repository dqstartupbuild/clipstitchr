import type { StudioEditorValidationIssue } from "../../types/studioEditor/StudioEditorValidationIssue";

export function addStudioEditorValidationIssue(
  issues: StudioEditorValidationIssue[],
  path: string,
  code: string,
  message: string,
): void {
  issues.push({ path, code, message });
}
