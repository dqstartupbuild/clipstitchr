import type { DemoAgentActionType } from "./DemoAgentActionType.js";
import type { OpenAiComputerAction } from "./OpenAiComputerAction.js";

export function getOpenAiComputerActionLogType(
  action: OpenAiComputerAction,
): DemoAgentActionType {
  switch (action.type) {
    case "double_click":
      return "doubleClick";
    case "drag":
      return "drag";
    case "keypress":
      return "pressKey";
    case "wait":
      return "wait";
    case "click":
    case "move":
    case "screenshot":
    case "scroll":
    case "type":
      return action.type;
    default:
      return "stop";
  }
}
