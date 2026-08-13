import type { StudioStitchValidationIssue } from "../../types/studioStitch/StudioStitchValidationIssue";

export function addStudioStitchValidationIssue(
  issues: StudioStitchValidationIssue[],
  path: string,
  code: string,
  message: string,
): void {
  issues.push({ path, code, message });
}
