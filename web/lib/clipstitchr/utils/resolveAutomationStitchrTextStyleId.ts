import { TEXT_OVERLAY_STYLES } from "../constants/textOverlayStyles";
import type { AutomationStitchrTextStyleChoice } from "../types/AutomationStitchrTextStyleChoice";
import type { TextOverlayStyleId } from "../types/TextOverlayStyleId";

function getSeededIndex(seed: string, length: number) {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) % length;
}

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
