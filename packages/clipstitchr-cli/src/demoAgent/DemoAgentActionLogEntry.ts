import type { DemoAgentActionType } from "./DemoAgentActionType.js";

export type DemoAgentActionLogEntry = {
  action: DemoAgentActionType;
  details?: Record<string, string | number | boolean | null>;
  result: "blocked" | "failed" | "ok" | "stopped";
  stepId?: string;
  stopReason?: string;
  timestamp: string;
  url: string;
};
