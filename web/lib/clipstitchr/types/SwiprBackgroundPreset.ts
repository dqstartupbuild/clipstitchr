import type { SwiprBackgroundPresetId } from "@/lib/clipstitchr/types/SwiprBackgroundPresetId";

export type SwiprBackgroundPreset = {
  id: SwiprBackgroundPresetId;
  label: string;
  baseColor: string;
  accentColor: string;
  secondaryColor: string;
};
