import type { CliDemoWalkthroughAgentRunMetadata } from "./CliDemoWalkthroughAgentRunMetadata";
import { readCliDemoWalkthroughString } from "./readCliDemoWalkthroughString";

function readSmallCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(10000, Math.round(value)))
    : undefined;
}

export function readCliDemoWalkthroughAgentRunMetadata(
  value: unknown,
): CliDemoWalkthroughAgentRunMetadata | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const rawAgentRun = value as Record<string, unknown>;
  const id = readCliDemoWalkthroughString(rawAgentRun.id, 160);

  if (!id || rawAgentRun.mode !== "guided-browser") {
    return undefined;
  }

  return {
    actionCount: readSmallCount(rawAgentRun.actionCount),
    actionLogObjectKey: readCliDemoWalkthroughString(
      rawAgentRun.actionLogObjectKey,
      500,
    ),
    approvedForUpload:
      typeof rawAgentRun.approvedForUpload === "boolean"
        ? rawAgentRun.approvedForUpload
        : undefined,
    id,
    mode: "guided-browser",
    screenshotCount: readSmallCount(rawAgentRun.screenshotCount),
    stopReason: readCliDemoWalkthroughString(rawAgentRun.stopReason, 160),
    uploaded:
      typeof rawAgentRun.uploaded === "boolean"
        ? rawAgentRun.uploaded
        : undefined,
  };
}
