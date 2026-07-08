import type { DemoAgentClickTarget } from "./DemoAgentClickTarget.js";

export type DemoAgentAction =
  | { path: string; reason?: string; stepId?: string; type: "navigate" }
  | {
      reason?: string;
      stepId?: string;
      target: DemoAgentClickTarget;
      type: "click";
    }
  | {
      reason?: string;
      stepId?: string;
      target: { label: string };
      type: "type";
      valueKey?: string;
      valueText?: string;
    }
  | {
      fileKey: string;
      reason?: string;
      stepId?: string;
      target: { label?: string; text?: string };
      type: "uploadFile";
    }
  | {
      path?: string;
      reason?: string;
      stepId?: string;
      timeoutMs?: number;
      type: "waitFor";
      visibleText?: string;
    }
  | { reason?: string; stepId?: string; type: "screenshot" }
  | { reason?: string; stepId: string; type: "finishStep" }
  | { reason: string; stepId?: string; type: "stop" };
