import type { DemoAgentAction } from "./DemoAgentAction.js";

export function createDemoAgentActionKey(action: DemoAgentAction) {
  switch (action.type) {
    case "click":
      return `${action.type}:${action.target.role ?? ""}:${action.target.name ?? action.target.label ?? action.target.text ?? ""}`;
    case "finishStep":
      return `${action.type}:${action.stepId}`;
    case "navigate":
      return `${action.type}:${action.path}`;
    case "screenshot":
      return `${action.type}:${action.stepId ?? ""}`;
    case "stop":
      return `${action.type}:${action.reason}`;
    case "type":
      return `${action.type}:${action.target.label}:${action.valueKey ?? action.valueText?.slice(0, 80) ?? ""}`;
    case "uploadFile":
      return `${action.type}:${action.target.label ?? action.target.text ?? ""}:${action.fileKey}`;
    case "waitFor":
      return `${action.type}:${action.path ?? action.visibleText ?? ""}`;
  }
}
