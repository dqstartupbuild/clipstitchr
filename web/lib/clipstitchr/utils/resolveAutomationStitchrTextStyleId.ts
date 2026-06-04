import { TEXT_OVERLAY_STYLES } from "../constants/textOverlayStyles";
import type { AutomationStitchrTextStyleChoice } from "../types/AutomationStitchrTextStyleChoice";
import type { TextOverlayStyleId } from "../types/TextOverlayStyleId";
import { getSeededIndex } from "./getSeededIndex";

export function resolveAutomationStitchrTextStyleId(
  choice: AutomationStitchrTextStyleChoice,
  seed: string,
): TextOverlayStyleId {
  if (choice !== "any") {
    return choice;
  }

  return TEXT_OVERLAY_STYLES[
    getSeededIndex(seed, TEXT_OVERLAY_STYLES.length)
  ].id;
}
