import type { SwaprCharacterOrientation } from "@/lib/clipr/types/SwaprCharacterOrientation";

export function getSwaprCharacterOrientation(
  value: string,
): SwaprCharacterOrientation {
  return value === "image" ? "image" : "video";
}
