import type { PlannedTextBox } from "@/lib/clipstitchr/tools/tiktokSafeZone/PlannedTextBox";
import type { SafeZoneAssessment } from "@/lib/clipstitchr/tools/tiktokSafeZone/SafeZoneAssessment";
import type { TikTokSafeZonePreset } from "@/lib/clipstitchr/tools/tiktokSafeZone/TikTokSafeZonePreset";
import { rectanglesIntersect } from "@/lib/clipstitchr/tools/tiktokSafeZone/rectanglesIntersect";

export function getSafeZoneAssessment(
  box: PlannedTextBox,
  preset: TikTokSafeZonePreset,
): SafeZoneAssessment {
  const intersectingLabels = preset.obstructions
    .filter((obstruction) => rectanglesIntersect(box, obstruction))
    .map((obstruction) => obstruction.label);

  return {
    clear: intersectingLabels.length === 0,
    intersectingLabels,
  };
}
