import type { SwiprBackgroundPresetId } from "@/lib/clipstitchr/types/SwiprBackgroundPresetId";

export type SwiprBackgroundSeedPlan = {
  id: string;
  name: string;
  tags: string[];
  description: string;
  details: string;
  prompt: string;
  source: "seed";
  presetId: SwiprBackgroundPresetId;
  category: string;
  nicheId: string;
  nicheLabel: string;
  styleId: string;
  styleLabel: string;
  settingId: string;
  setting: string;
};
