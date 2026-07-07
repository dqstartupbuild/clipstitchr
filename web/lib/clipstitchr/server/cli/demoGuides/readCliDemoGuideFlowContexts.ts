import type { CliDemoGuideFlowContext } from "@/lib/clipstitchr/server/cli/demoGuides/CliDemoGuideFlowContext";

const cliDemoGuideFlowContextLimit = 8;

function readCliDemoGuideFlowContext(
  value: unknown,
): CliDemoGuideFlowContext | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const path = typeof record.path === "string" ? record.path.trim() : "";
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const confidence =
    typeof record.confidence === "string" ? record.confidence.trim() : "low";

  if (!path.startsWith("/") || path.startsWith("//")) {
    return null;
  }

  return {
    confidence: confidence.slice(0, 24),
    name: name.slice(0, 120) || path,
    path: path.slice(0, 200),
  };
}

export function readCliDemoGuideFlowContexts(
  value: unknown,
): CliDemoGuideFlowContext[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(readCliDemoGuideFlowContext)
    .filter((flow): flow is CliDemoGuideFlowContext => flow !== null)
    .slice(0, cliDemoGuideFlowContextLimit);
}
