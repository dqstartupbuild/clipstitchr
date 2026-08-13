import type { LazyReelWorkflowResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowResult";

export function parseStudioLazyReelStoredWorkflowResult(
  payloadJson: string,
): LazyReelWorkflowResult {
  const parsed = JSON.parse(payloadJson) as unknown;

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("workflow" in parsed) ||
    typeof parsed.workflow !== "string" ||
    !("data" in parsed) ||
    !parsed.data ||
    typeof parsed.data !== "object" ||
    !("executionStatus" in parsed.data) ||
    parsed.data.executionStatus !== "plan_only"
  ) {
    throw new Error("Saved workflow plan is not readable.");
  }

  return parsed as LazyReelWorkflowResult;
}
