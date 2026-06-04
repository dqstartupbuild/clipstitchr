import { defaultAutomationStitchrTextStyleChoice } from "../constants/defaultAutomationStitchrTextStyleChoice";
import { TEXT_OVERLAY_STYLES } from "../constants/textOverlayStyles";
import type { AutomationStitchrTextStyleChoice } from "../types/AutomationStitchrTextStyleChoice";

export function getAutomationStitchrTextStyleChoice(
  value: unknown,
): AutomationStitchrTextStyleChoice {
  if (value === "any") {
    return value;
  }

  return TEXT_OVERLAY_STYLES.some((style) => style.id === value)
    ? (value as AutomationStitchrTextStyleChoice)
    : defaultAutomationStitchrTextStyleChoice;
}
