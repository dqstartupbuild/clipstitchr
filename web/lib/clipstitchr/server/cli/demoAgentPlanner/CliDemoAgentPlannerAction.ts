export type CliDemoAgentPlannerAction =
  | { path: string; reason?: string; stepId?: string; type: "navigate" }
  | {
      reason?: string;
      stepId?: string;
      target: {
        label?: string;
        name?: string;
        role?:
          | "button"
          | "checkbox"
          | "combobox"
          | "link"
          | "menuitem"
          | "tab"
          | "textbox";
        text?: string;
      };
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
  | {
      direction: "down" | "up";
      reason?: string;
      stepId?: string;
      type: "scroll";
    }
  | {
      optionLabel: string;
      reason?: string;
      stepId?: string;
      target: { label: string };
      type: "selectOption";
    }
  | {
      key:
        | "ArrowDown"
        | "ArrowLeft"
        | "ArrowRight"
        | "ArrowUp"
        | "Backspace"
        | "Enter"
        | "Escape"
        | "Space"
        | "Tab";
      reason?: string;
      stepId?: string;
      target?: { label?: string };
      type: "pressKey";
    }
  | {
      reason?: string;
      stepId?: string;
      target: { label: string };
      type: "clearField";
    }
  | {
      reason?: string;
      stepId?: string;
      text: string;
      type: "scrollToText";
    }
  | {
      reason?: string;
      stepId?: string;
      target: CliDemoAgentPlannerActionClickTarget;
      type: "scrollToControl";
    }
  | {
      reason?: string;
      stepId?: string;
      target: CliDemoAgentPlannerActionClickTarget;
      type: "clickFirstMatching";
    }
  | {
      actionName: string;
      cardText: string;
      reason?: string;
      stepId?: string;
      type: "clickCardAction";
    }
  | {
      cardText: string;
      checked: boolean;
      reason?: string;
      stepId?: string;
      type: "selectCard";
    }
  | {
      reason?: string;
      statusText?: string;
      stepId?: string;
      timeoutMs?: number;
      type: "waitForJob";
      visibleText?: string;
    }
  | {
      reason?: string;
      stepId?: string;
      target: CliDemoAgentPlannerActionClickTarget;
      timeoutMs?: number;
      type: "waitForElementEnabled";
    }
  | {
      mediaType:
        | "any"
        | "audio"
        | "avatar"
        | "demo"
        | "document"
        | "file"
        | "image"
        | "media"
        | "stitch"
        | "template"
        | "ugc"
        | "video";
      reason?: string;
      searchText?: string;
      stepId?: string;
      type: "chooseFileFromLibrary";
    }
  | {
      checked: boolean;
      reason?: string;
      stepId?: string;
      target: { label: string };
      type: "toggle";
    }
  | {
      mode: string;
      reason?: string;
      stepId?: string;
      type: "setMode";
    }
  | {
      reason?: string;
      stepId?: string;
      target: CliDemoAgentPlannerActionClickTarget;
      type: "openMenu";
    }
  | {
      name: string;
      reason?: string;
      stepId?: string;
      type: "chooseMenuItem";
    }
  | {
      reason?: string;
      stepId?: string;
      type: "closeDialog";
    }
  | {
      reason?: string;
      sourceText: string;
      stepId?: string;
      targetText: string;
      type: "dragAndDrop";
    }
  | {
      reason?: string;
      stepId?: string;
      target: { label: string };
      type: "setSlider";
      value: number;
    }
  | {
      mediaAction: "pause" | "play";
      reason?: string;
      stepId?: string;
      targetLabel?: string;
      type: "playPauseMedia";
    }
  | {
      reason?: string;
      seconds: number;
      stepId?: string;
      targetLabel?: string;
      type: "seekMedia";
    }
  | {
      reason?: string;
      stepId?: string;
      target: CliDemoAgentPlannerActionClickTarget;
      type: "downloadFile";
    }
  | {
      reason?: string;
      stepId?: string;
      target: CliDemoAgentPlannerActionClickTarget;
      type: "copyToClipboard";
    }
  | { reason?: string; stepId?: string; type: "screenshot" }
  | { reason?: string; stepId: string; type: "finishStep" }
  | { reason: string; stepId?: string; type: "stop" };

export type CliDemoAgentPlannerActionClickTarget = {
  label?: string;
  name?: string;
  role?:
    | "button"
    | "checkbox"
    | "combobox"
    | "link"
    | "menuitem"
    | "tab"
    | "textbox";
  text?: string;
};
