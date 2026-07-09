import type { OpenAiComputerAction } from "./OpenAiComputerAction.js";
import { normalizeOpenAiComputerKey } from "./normalizeOpenAiComputerKey.js";

const pageScrollKeys = new Set(["PageDown", "PageUp", "Space"]);

export function getOpenAiComputerActionIsPageScroll(
  action: OpenAiComputerAction,
) {
  if (action.type === "scroll") {
    return true;
  }

  if (action.type !== "keypress") {
    return false;
  }

  return action.keys.some((key) =>
    pageScrollKeys.has(normalizeOpenAiComputerKey(key)),
  );
}
