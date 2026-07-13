import type { HookVisualOpeningSource } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualOpeningSource";
import type { HookVisualStoryboardBeat } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualStoryboardBeat";

export type HookVisualPlan = {
  ctaBridge: string;
  demoHandoff: string;
  onScreenText: string;
  openingShot: string;
  openingSource: HookVisualOpeningSource;
  storyboard: HookVisualStoryboardBeat[];
};
