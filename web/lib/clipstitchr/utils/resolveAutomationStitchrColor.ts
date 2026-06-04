import { TEXT_OVERLAY_COLOR_OPTIONS } from "../constants/textOverlayColorOptions";
import type { AutomationStitchrColorChoice } from "../types/AutomationStitchrColorChoice";
import { getSeededIndex } from "./getSeededIndex";

export function resolveAutomationStitchrColor(
  choice: AutomationStitchrColorChoice,
  seed: string,
) {
  if (choice !== "any") {
    return choice;
  }

  return TEXT_OVERLAY_COLOR_OPTIONS[
    getSeededIndex(seed, TEXT_OVERLAY_COLOR_OPTIONS.length)
  ];
}
