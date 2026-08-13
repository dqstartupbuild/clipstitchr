import type { StudioStitchClassicReelRecipeV1 } from "./StudioStitchClassicReelRecipeV1";
import type { StudioStitchTalkingVideoRecipeV1 } from "./StudioStitchTalkingVideoRecipeV1";

export type StudioStitchRecipeV1 =
  | StudioStitchClassicReelRecipeV1
  | StudioStitchTalkingVideoRecipeV1;
