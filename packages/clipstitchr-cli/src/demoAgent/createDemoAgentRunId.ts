import { randomUUID } from "node:crypto";

export function createDemoAgentRunId() {
  return `agent_run_${Date.now().toString(36)}_${randomUUID().slice(0, 8)}`;
}
