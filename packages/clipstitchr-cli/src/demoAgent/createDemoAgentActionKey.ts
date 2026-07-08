import type { DemoAgentAction } from "./DemoAgentAction.js";

function getTargetKey(
  target: {
    label?: string;
    name?: string;
    role?: string;
    text?: string;
  },
) {
  return `${target.role ?? ""}:${target.name ?? target.label ?? target.text ?? ""}`;
}

export function createDemoAgentActionKey(action: DemoAgentAction) {
  switch (action.type) {
    case "click":
      return `${action.type}:${getTargetKey(action.target)}`;
    case "chooseFileFromLibrary":
      return `${action.type}:${action.mediaType}:${action.searchText ?? ""}`;
    case "chooseMenuItem":
      return `${action.type}:${action.name}`;
    case "clearField":
      return `${action.type}:${action.target.label}`;
    case "clickCardAction":
      return `${action.type}:${action.cardText}:${action.actionName}`;
    case "clickFirstMatching":
      return `${action.type}:${getTargetKey(action.target)}`;
    case "closeDialog":
      return action.type;
    case "copyToClipboard":
      return `${action.type}:${getTargetKey(action.target)}`;
    case "downloadFile":
      return `${action.type}:${getTargetKey(action.target)}`;
    case "dragAndDrop":
      return `${action.type}:${action.sourceText}:${action.targetText}`;
    case "finishStep":
      return `${action.type}:${action.stepId}`;
    case "navigate":
      return `${action.type}:${action.path}`;
    case "openMenu":
      return `${action.type}:${getTargetKey(action.target)}`;
    case "playPauseMedia":
      return `${action.type}:${action.targetLabel ?? ""}:${action.mediaAction}`;
    case "pressKey":
      return `${action.type}:${action.target?.label ?? ""}:${action.key}`;
    case "scroll":
      return `${action.type}:${action.direction}`;
    case "scrollToControl":
      return `${action.type}:${getTargetKey(action.target)}`;
    case "scrollToText":
      return `${action.type}:${action.text}`;
    case "screenshot":
      return `${action.type}:${action.stepId ?? ""}`;
    case "seekMedia":
      return `${action.type}:${action.targetLabel ?? ""}:${action.seconds}`;
    case "selectCard":
      return `${action.type}:${action.cardText}:${action.checked}`;
    case "selectOption":
      return `${action.type}:${action.target.label}:${action.optionLabel}`;
    case "setMode":
      return `${action.type}:${action.mode}`;
    case "setSlider":
      return `${action.type}:${action.target.label}:${action.value}`;
    case "stop":
      return `${action.type}:${action.reason}`;
    case "toggle":
      return `${action.type}:${action.target.label}:${action.checked}`;
    case "type":
      return `${action.type}:${action.target.label}:${action.valueKey ?? action.valueText?.slice(0, 80) ?? ""}`;
    case "uploadFile":
      return `${action.type}:${action.target.label ?? action.target.text ?? ""}:${action.fileKey}`;
    case "waitFor":
      return `${action.type}:${action.path ?? action.visibleText ?? ""}`;
    case "waitForElementEnabled":
      return `${action.type}:${getTargetKey(action.target)}`;
    case "waitForJob":
      return `${action.type}:${action.statusText ?? action.visibleText ?? ""}`;
  }
}
