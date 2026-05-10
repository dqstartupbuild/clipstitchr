import { SWIPR_BACKGROUND_PRESETS } from "@/lib/clipstitchr/constants/swiprBackgroundPresets";
import type { SwiprBackgroundPresetId } from "@/lib/clipstitchr/types/SwiprBackgroundPresetId";

export function getSwiprBackgroundPresetId(value: string) {
  const preset = SWIPR_BACKGROUND_PRESETS.find((item) => item.id === value);

  return (preset?.id ?? "studio") satisfies SwiprBackgroundPresetId;
}
