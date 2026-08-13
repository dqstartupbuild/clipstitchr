import type { StudioStitchClassicHookFamily } from "../../types/studioStitch/StudioStitchClassicHookFamily";

export const STUDIO_STITCH_CLASSIC_HOOK_FAMILIES = Object.freeze([
  "whenRelatable",
  "pov",
  "statistic",
  "question",
  "confession",
  "nobodyTalksAbout",
  "challenge",
  "beforeAfter",
] as const satisfies readonly StudioStitchClassicHookFamily[]);
