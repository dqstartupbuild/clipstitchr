import type { StudioStitchRecipeV1 } from "../../types/studioStitch/StudioStitchRecipeV1";
import { validateStudioStitchRecipeV1 } from "./validateStudioStitchRecipeV1";

export function assertStudioStitchRecipeV1(
  value: unknown,
): asserts value is StudioStitchRecipeV1 {
  const issues = validateStudioStitchRecipeV1(value);
  if (issues.length === 0) {
    return;
  }
  const summary = issues
    .slice(0, 5)
    .map((issue) => `${issue.path}: ${issue.message}`)
    .join(" ");
  throw new Error(`Invalid Studio Stitch recipe. ${summary}`);
}
