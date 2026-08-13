import type { StudioStitchTalkingHookFamily } from "../../types/studioStitch/StudioStitchTalkingHookFamily";

export const STUDIO_STITCH_TALKING_HOOK_FAMILIES = Object.freeze([
  "deception",
  "identityDream",
  "socialProblem",
  "genuineShock",
  "whichIsReal",
] as const satisfies readonly StudioStitchTalkingHookFamily[]);
