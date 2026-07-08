import type { DemoAgentAction } from "./DemoAgentAction.js";
import type { DemoAgentClickTarget } from "./DemoAgentClickTarget.js";

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

function readClickTarget(value: unknown): DemoAgentClickTarget {
  const target = readObject(value, "Planner click actions need a target object.");

  if ("selector" in target) {
    throw new Error("Planner actions cannot use CSS selectors.");
  }

  return {
    label: readOptionalString(target.label),
    name: readOptionalString(target.name),
    role: readClickRole(target.role),
    text: readOptionalString(target.text),
  };
}

function readClickRole(value: unknown): DemoAgentClickTarget["role"] {
  if (value === undefined) {
    return undefined;
  }

  if (
    value === "button" ||
    value === "checkbox" ||
    value === "link" ||
    value === "menuitem" ||
    value === "tab"
  ) {
    return value;
  }

  throw new Error("Planner click actions can only use approved roles.");
}

export function parseDemoAgentPlannerAction(text: string): DemoAgentAction {
  const action = readObject(
    JSON.parse(text) as unknown,
    "Planner output must be one JSON object.",
  );
  const type = readRequiredString(action.type, "Planner action needs a type.");
  const reason = readOptionalString(action.reason);
  const stepId = readOptionalString(action.stepId);

  switch (type) {
    case "click":
      return {
        reason,
        stepId,
        target: readClickTarget(action.target),
        type,
      };
    case "finishStep":
      return {
        reason,
        stepId: readRequiredString(
          action.stepId,
          "Finish-step actions need a step ID.",
        ),
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
      return {
        reason,
        stepId,
        type,
      };
    case "stop":
      return {
        reason: readRequiredString(action.reason, "Stop actions need a reason."),
        stepId,
        type,
      };
    case "type": {
      const target = readObject(
        action.target,
        "Type actions need a target object.",
      );
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
      const target = readObject(
        action.target,
        "Upload actions need a target object.",
      );

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
        timeoutMs: readOptionalNumber(action.timeoutMs),
        type,
        visibleText: readOptionalString(action.visibleText),
      };
    default:
      throw new Error("Planner action type is not supported.");
  }
}
