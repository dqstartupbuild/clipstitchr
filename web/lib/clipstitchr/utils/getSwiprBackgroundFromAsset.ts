import type { SwiprBackground } from "@/lib/clipstitchr/types/SwiprBackground";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";

export function getSwiprBackgroundFromAsset(
  background: SwiprBackgroundAsset,
): SwiprBackground {
  return {
    id: background.id,
    name: background.name,
    blob: background.blob,
    source: background.source,
  };
}
