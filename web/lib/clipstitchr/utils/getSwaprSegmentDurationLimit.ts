import type { SwaprCharacterOrientation } from "@/lib/clipstitchr/types/SwaprCharacterOrientation";

export function getSwaprSegmentDurationLimit(
  characterOrientation: SwaprCharacterOrientation,
) {
  return characterOrientation === "image" ? 10 : 30;
}
