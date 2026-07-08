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
    case "chooseFileFromLibrary":
      return [
        action.mediaType,
        action.reason,
        action.searchText,
      ];
    case "chooseMenuItem":
      return [action.name, action.reason];
    case "clearField":
      return [action.reason, action.target.label];
    case "clickCardAction":
      return [action.actionName, action.cardText, action.reason];
    case "clickFirstMatching":
    case "copyToClipboard":
    case "downloadFile":
    case "openMenu":
    case "scrollToControl":
    case "waitForElementEnabled":
      return [
        action.reason,
        action.target.label,
        action.target.name,
        action.target.text,
      ];
    case "closeDialog":
      return [action.reason];
    case "dragAndDrop":
      return [action.reason, action.sourceText, action.targetText];
    case "finishStep":
    case "navigate":
    case "scroll":
    case "screenshot":
      return [action.reason];
    case "playPauseMedia":
      return [action.mediaAction, action.reason, action.targetLabel];
    case "pressKey":
      return [action.key, action.reason, action.target?.label];
    case "scrollToText":
      return [action.reason, action.text];
    case "seekMedia":
      return [action.reason, action.targetLabel];
    case "selectOption":
      return [action.optionLabel, action.reason, action.target.label];
    case "setMode":
      return [action.mode, action.reason];
    case "setSlider":
      return [action.reason, action.target.label];
    case "stop":
      return [action.reason];
    case "toggle":
      return [action.reason, action.target.label];
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
    case "waitForJob":
      return [action.reason, action.statusText, action.visibleText];
  }
}
