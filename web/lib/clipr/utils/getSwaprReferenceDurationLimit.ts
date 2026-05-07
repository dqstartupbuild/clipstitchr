import type { SwaprCharacterOrientation } from "@/lib/clipr/types/SwaprCharacterOrientation";

export function getSwaprReferenceDurationLimit(
  characterOrientation: SwaprCharacterOrientation,
) {
  return characterOrientation === "image" ? 10 : 30;
}
