import type { DemoAgentActionLogEntry } from "./DemoAgentActionLogEntry.js";
import type { DemoAgentActionType } from "./DemoAgentActionType.js";

export function createDemoAgentActionLogEntry(input: {
  action: DemoAgentActionType;
  details?: Record<string, string | number | boolean | null>;
  result: DemoAgentActionLogEntry["result"];
  stepId?: string;
  stopReason?: string;
  url: string;
}): DemoAgentActionLogEntry {
  return {
    action: input.action,
    details: input.details,
    result: input.result,
    stepId: input.stepId,
    stopReason: input.stopReason,
    timestamp: new Date().toISOString(),
    url: input.url,
  };
}
