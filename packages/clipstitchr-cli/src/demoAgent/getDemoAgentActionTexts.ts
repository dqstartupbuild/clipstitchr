import type { DemoAgentAction } from "./DemoAgentAction.js";

export function getDemoAgentActionTexts(action: DemoAgentAction) {
  switch (action.type) {
    case "click":
      return [
        action.reason,
        action.target.label,
        action.target.name,
        action.target.text,
      ];
    case "finishStep":
    case "navigate":
    case "scroll":
    case "screenshot":
      return [action.reason];
    case "stop":
      return [action.reason];
    case "type":
      return [
        action.reason,
        action.target.label,
        action.valueKey,
        action.valueText,
      ];
    case "uploadFile":
      return [
        action.fileKey,
        action.reason,
        action.target.label,
        action.target.text,
      ];
    case "waitFor":
      return [action.path, action.reason, action.visibleText];
  }
}
