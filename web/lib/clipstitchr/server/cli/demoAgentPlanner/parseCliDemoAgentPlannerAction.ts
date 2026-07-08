import type {
  CliDemoAgentPlannerAction,
  CliDemoAgentPlannerActionClickTarget,
} from "@/lib/clipstitchr/server/cli/demoAgentPlanner/CliDemoAgentPlannerAction";

function getJsonText(outputText: string) {
  const trimmed = outputText.trim();

  return trimmed.startsWith("```")
    ? trimmed
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim()
    : trimmed.slice(trimmed.indexOf("{"), trimmed.lastIndexOf("}") + 1);
}

function readObject(value: unknown, message: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(message);
  }

  return value as Record<string, unknown>;
}

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readRequiredString(value: unknown, message: string) {
  const text = readOptionalString(value);

  if (!text) {
    throw new Error(message);
  }

  return text;
}

function readOptionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function readRequiredNumber(value: unknown, message: string) {
  const number = readOptionalNumber(value);

  if (number === undefined) {
    throw new Error(message);
  }

  return number;
}

function readBoolean(value: unknown, message: string) {
  if (typeof value !== "boolean") {
    throw new Error(message);
  }

  return value;
}

function readScrollDirection(value: unknown) {
  if (value === "down" || value === "up") {
    return value;
  }

  throw new Error("Scroll actions need direction down or up.");
}

function readPressKey(value: unknown) {
  if (
    value === "ArrowDown" ||
    value === "ArrowLeft" ||
    value === "ArrowRight" ||
    value === "ArrowUp" ||
    value === "Backspace" ||
    value === "Enter" ||
    value === "Escape" ||
    value === "Space" ||
    value === "Tab"
  ) {
    return value;
  }

  throw new Error("Press-key actions need an approved key.");
}

function readMediaType(value: unknown) {
  if (
    value === "any" ||
    value === "audio" ||
    value === "avatar" ||
    value === "demo" ||
    value === "document" ||
    value === "file" ||
    value === "image" ||
    value === "media" ||
    value === "stitch" ||
    value === "template" ||
    value === "ugc" ||
    value === "video"
  ) {
    return value;
  }

  throw new Error("Library file choices need an approved media type.");
}

function readMediaAction(value: unknown) {
  if (value === "pause" || value === "play") {
    return value;
  }

  throw new Error("Media actions need play or pause.");
}

function readRole(
  value: unknown,
): CliDemoAgentPlannerActionClickTarget["role"] {
  if (value === undefined) {
    return undefined;
  }

  if (
    value === "button" ||
    value === "checkbox" ||
    value === "combobox" ||
    value === "link" ||
    value === "menuitem" ||
    value === "tab" ||
    value === "textbox"
  ) {
    return value;
  }

  if (value === "field" || value === "input") {
    return undefined;
  }

  throw new Error("Planner click actions can only use approved roles.");
}

function readClickTarget(value: unknown): CliDemoAgentPlannerActionClickTarget {
  const target = readObject(value, "Planner click actions need a target object.");

  if ("selector" in target) {
    throw new Error("Planner actions cannot use CSS selectors.");
  }

  return {
    label: readOptionalString(target.label),
    name: readOptionalString(target.name),
    role: readRole(target.role),
    text: readOptionalString(target.text),
  };
}

export function parseCliDemoAgentPlannerAction(
  outputText: string,
): CliDemoAgentPlannerAction {
  const action = readObject(
    JSON.parse(getJsonText(outputText)) as unknown,
    "Planner output must be one JSON object.",
  );
  const type = readRequiredString(action.type, "Planner action needs a type.");
  const reason = readOptionalString(action.reason);
  const stepId = readOptionalString(action.stepId);

  switch (type) {
    case "click": {
      return {
        reason,
        stepId,
        target: readClickTarget(action.target),
        type,
      };
    }
    case "finishStep":
      return {
        reason,
        stepId: readRequiredString(action.stepId, "Finish-step needs a step ID."),
        type,
      };
    case "navigate":
      return {
        path: readRequiredString(action.path, "Navigate actions need a path."),
        reason,
        stepId,
        type,
      };
    case "screenshot":
      return { reason, stepId, type };
    case "scroll":
      return {
        direction: readScrollDirection(action.direction),
        reason,
        stepId,
        type,
      };
    case "selectOption": {
      const target = readObject(
        action.target,
        "Select-option actions need a target.",
      );

      return {
        optionLabel: readRequiredString(
          action.optionLabel,
          "Select-option actions need an option label.",
        ),
        reason,
        stepId,
        target: {
          label: readRequiredString(
            target.label,
            "Select-option actions need a visible label.",
          ),
        },
        type,
      };
    }
    case "pressKey": {
      const target =
        action.target === undefined
          ? undefined
          : readObject(action.target, "Press-key target must be an object.");

      return {
        key: readPressKey(action.key),
        reason,
        stepId,
        target: target
          ? {
              label: readOptionalString(target.label),
            }
          : undefined,
        type,
      };
    }
    case "clearField": {
      const target = readObject(action.target, "Clear-field actions need a target.");

      return {
        reason,
        stepId,
        target: {
          label: readRequiredString(
            target.label,
            "Clear-field actions need a visible label.",
          ),
        },
        type,
      };
    }
    case "scrollToText":
      return {
        reason,
        stepId,
        text: readRequiredString(action.text, "Scroll-to-text actions need text."),
        type,
      };
    case "scrollToControl":
      return {
        reason,
        stepId,
        target: readClickTarget(action.target),
        type,
      };
    case "clickFirstMatching":
      return {
        reason,
        stepId,
        target: readClickTarget(action.target),
        type,
      };
    case "clickCardAction":
      return {
        actionName: readRequiredString(
          action.actionName,
          "Card actions need an action name.",
        ),
        cardText: readRequiredString(
          action.cardText,
          "Card actions need card text.",
        ),
        reason,
        stepId,
        type,
      };
    case "selectCard":
      return {
        cardText: readRequiredString(
          action.cardText,
          "Card selection actions need card text.",
        ),
        checked: readBoolean(
          action.checked,
          "Card selection actions need checked true or false.",
        ),
        reason,
        stepId,
        type,
      };
    case "waitForJob":
      return {
        reason,
        statusText: readOptionalString(action.statusText),
        stepId,
        timeoutMs: readOptionalNumber(action.timeoutMs),
        type,
        visibleText: readOptionalString(action.visibleText),
      };
    case "waitForElementEnabled":
      return {
        reason,
        stepId,
        target: readClickTarget(action.target),
        timeoutMs: readOptionalNumber(action.timeoutMs),
        type,
      };
    case "chooseFileFromLibrary":
      return {
        mediaType: readMediaType(action.mediaType),
        reason,
        searchText: readOptionalString(action.searchText),
        stepId,
        type,
      };
    case "toggle": {
      const target = readObject(action.target, "Toggle actions need a target.");

      return {
        checked: readBoolean(
          action.checked,
          "Toggle actions need checked true or false.",
        ),
        reason,
        stepId,
        target: {
          label: readRequiredString(
            target.label,
            "Toggle actions need a visible label.",
          ),
        },
        type,
      };
    }
    case "setMode":
      return {
        mode: readRequiredString(action.mode, "Set-mode actions need a mode."),
        reason,
        stepId,
        type,
      };
    case "openMenu":
      return {
        reason,
        stepId,
        target: readClickTarget(action.target),
        type,
      };
    case "chooseMenuItem":
      return {
        name: readRequiredString(action.name, "Menu item actions need a name."),
        reason,
        stepId,
        type,
      };
    case "closeDialog":
      return {
        reason,
        stepId,
        type,
      };
    case "dragAndDrop":
      return {
        reason,
        sourceText: readRequiredString(
          action.sourceText,
          "Drag actions need source text.",
        ),
        stepId,
        targetText: readRequiredString(
          action.targetText,
          "Drag actions need target text.",
        ),
        type,
      };
    case "setSlider": {
      const target = readObject(action.target, "Slider actions need a target.");

      return {
        reason,
        stepId,
        target: {
          label: readRequiredString(
            target.label,
            "Slider actions need a visible label.",
          ),
        },
        type,
        value: readRequiredNumber(action.value, "Slider actions need a value."),
      };
    }
    case "playPauseMedia":
      return {
        mediaAction: readMediaAction(action.mediaAction),
        reason,
        stepId,
        targetLabel: readOptionalString(action.targetLabel),
        type,
      };
    case "seekMedia":
      return {
        reason,
        seconds: readRequiredNumber(action.seconds, "Seek actions need seconds."),
        stepId,
        targetLabel: readOptionalString(action.targetLabel),
        type,
      };
    case "downloadFile":
      return {
        reason,
        stepId,
        target: readClickTarget(action.target),
        type,
      };
    case "copyToClipboard":
      return {
        reason,
        stepId,
        target: readClickTarget(action.target),
        type,
      };
    case "stop":
      return {
        reason: readRequiredString(action.reason, "Stop actions need a reason."),
        stepId,
        type,
      };
    case "type": {
      const target = readObject(action.target, "Type actions need a target.");
      const valueKey = readOptionalString(action.valueKey);
      const valueText = readOptionalString(action.valueText);

      if (!valueKey && !valueText) {
        throw new Error("Type actions need a value key or text.");
      }

      if (valueText && valueText.length > 1000) {
        throw new Error("Type action text is too long.");
      }

      return {
        reason,
        stepId,
        target: {
          label: readRequiredString(
            target.label,
            "Type actions need a visible label.",
          ),
        },
        type,
        valueKey,
        valueText,
      };
    }
    case "uploadFile": {
      const target = readObject(action.target, "Upload actions need a target.");

      return {
        fileKey: readRequiredString(
          action.fileKey,
          "Upload actions need a file key.",
        ),
        reason,
        stepId,
        target: {
          label: readOptionalString(target.label),
          text: readOptionalString(target.text),
        },
        type,
      };
    }
    case "waitFor":
      return {
        path: readOptionalString(action.path),
        reason,
        stepId,
        timeoutMs:
          typeof action.timeoutMs === "number" &&
          Number.isFinite(action.timeoutMs)
            ? action.timeoutMs
            : undefined,
        type,
        visibleText: readOptionalString(action.visibleText),
      };
    default:
      throw new Error("Planner action type is not supported.");
  }
}
