import type { CliDemoAppWorkflowHint } from "@/lib/clipstitchr/server/cli/appContext/CliDemoAppWorkflowHint";
import { readCliDemoAppWorkflowHint } from "@/lib/clipstitchr/server/cli/appContext/readCliDemoAppWorkflowHint";

export function readCliDemoAppWorkflowHints(
  value: unknown,
): CliDemoAppWorkflowHint[] {
  return Array.isArray(value)
    ? value
        .map(readCliDemoAppWorkflowHint)
        .filter((hint): hint is CliDemoAppWorkflowHint => hint !== null)
        .slice(0, 16)
    : [];
}
