import type { SwaprCharacterOrientation } from "@/lib/clipstitchr/types/SwaprCharacterOrientation";

export function getSwaprCharacterOrientation(
  value: string,
): SwaprCharacterOrientation {
  return value === "image" ? "image" : "video";
}
