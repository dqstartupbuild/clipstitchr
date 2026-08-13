import type { StudioStitchCaptionPlan } from "./StudioStitchCaptionPlan";
import type { StudioStitchRecipeBaseV1 } from "./StudioStitchRecipeBaseV1";
import type { StudioStitchTalkingHookFamily } from "./StudioStitchTalkingHookFamily";
import type { StudioStitchVoicePlan } from "./StudioStitchVoicePlan";

export type StudioStitchTalkingVideoRecipeV1 = StudioStitchRecipeBaseV1<
  "talkingVideo",
  StudioStitchTalkingHookFamily,
  StudioStitchVoicePlan,
  StudioStitchCaptionPlan
>;
