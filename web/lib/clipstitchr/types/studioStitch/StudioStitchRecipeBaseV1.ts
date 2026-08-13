import type { StudioStitchAvailability } from "./StudioStitchAvailability";
import type { StudioStitchCanvas } from "./StudioStitchCanvas";
import type { StudioStitchCtaPlan } from "./StudioStitchCtaPlan";
import type { StudioStitchHookFamily } from "./StudioStitchHookFamily";
import type { StudioStitchHookPlan } from "./StudioStitchHookPlan";
import type { StudioStitchMusicPlan } from "./StudioStitchMusicPlan";
import type { StudioStitchPipeline } from "./StudioStitchPipeline";
import type { StudioStitchProductGrounding } from "./StudioStitchProductGrounding";
import type { StudioStitchProviderRequirement } from "./StudioStitchProviderRequirement";
import type { StudioStitchSafeArea } from "./StudioStitchSafeArea";
import type { StudioStitchSegmentPlan } from "./StudioStitchSegmentPlan";
import type { StudioStitchTextOverlayPlan } from "./StudioStitchTextOverlayPlan";
import type { StudioStitchTransitionPlan } from "./StudioStitchTransitionPlan";

export type StudioStitchRecipeBaseV1<
  Pipeline extends StudioStitchPipeline,
  Family extends StudioStitchHookFamily,
  Voice,
  Captions,
> = {
  readonly recipeVersion: 1;
  readonly id: string;
  readonly productId: string;
  readonly pipeline: Pipeline;
  readonly durationSeconds: number;
  readonly canvas: StudioStitchCanvas;
  readonly safeArea: StudioStitchSafeArea;
  readonly grounding: StudioStitchProductGrounding;
  readonly hook: StudioStitchHookPlan<Family>;
  readonly segments: readonly StudioStitchSegmentPlan[];
  readonly textOverlays: readonly StudioStitchTextOverlayPlan[];
  readonly transitions: readonly StudioStitchTransitionPlan[];
  readonly music: StudioStitchMusicPlan;
  readonly cta: StudioStitchCtaPlan;
  readonly providerRequirements: readonly StudioStitchProviderRequirement[];
  readonly availability: StudioStitchAvailability;
  readonly voice: Voice;
  readonly captions: Captions;
};
