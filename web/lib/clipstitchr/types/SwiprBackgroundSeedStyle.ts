import type { SwiprBackgroundPresetId } from "@/lib/clipstitchr/types/SwiprBackgroundPresetId";

export type SwiprBackgroundSeedStyle = {
  id: string;
  label: string;
  presetId: SwiprBackgroundPresetId;
  tags: readonly string[];
  promptDirection: string;
  lighting: string;
  palette: string;
  composition: string;
};
