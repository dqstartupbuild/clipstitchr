import type { StudioStitchValidationIssue } from "../../types/studioStitch/StudioStitchValidationIssue";

export function addStudioStitchUnexpectedKeyIssues(
  value: Record<string, unknown>,
  path: string,
  allowedKeys: readonly string[],
  issues: StudioStitchValidationIssue[],
): void {
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      issues.push({
        path: path === "$" ? key : `${path}.${key}`,
        code: "unexpected_key",
        message: "This field is not part of Studio Stitch recipe version 1.",
      });
    }
  }
}
