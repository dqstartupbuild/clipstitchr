import type { LazyReelToolResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolResult";

export function parseStudioLazyReelStoredResult(
  payloadJson: string,
): LazyReelToolResult {
  const parsed = JSON.parse(payloadJson) as unknown;

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("tool" in parsed) ||
    typeof parsed.tool !== "string" ||
    !("title" in parsed) ||
    typeof parsed.title !== "string" ||
    !("sections" in parsed) ||
    !Array.isArray(parsed.sections) ||
    !("evidence" in parsed) ||
    !Array.isArray(parsed.evidence)
  ) {
    throw new Error("Saved research result is not readable.");
  }

  return parsed as LazyReelToolResult;
}
