import type { LazyReelToolResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolResult";
import type { LazyReelWorkflowResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowResult";

export function parseLazyReelStoredResult(payloadJson: string) {
  try {
    const value = JSON.parse(payloadJson) as unknown;

    if (
      !value ||
      typeof value !== "object" ||
      !("title" in value) ||
      typeof value.title !== "string" ||
      !("summary" in value) ||
      typeof value.summary !== "string"
    ) {
      return null;
    }

    if ("tool" in value && typeof value.tool === "string") {
      return value as LazyReelToolResult;
    }

    if ("workflow" in value && typeof value.workflow === "string") {
      return value as LazyReelWorkflowResult;
    }

    return null;
  } catch {
    return null;
  }
}
