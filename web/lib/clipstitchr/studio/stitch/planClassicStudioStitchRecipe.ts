import type { StudioStitchClassicReelPlanInput } from "../../types/studioStitch/StudioStitchClassicReelPlanInput";
import type { StudioStitchClassicReelRecipeV1 } from "../../types/studioStitch/StudioStitchClassicReelRecipeV1";
import { allocateStudioStitchFrameDurations } from "./allocateStudioStitchFrameDurations";
import { assertStudioStitchProviderAvailabilityInputs } from "./assertStudioStitchProviderAvailabilityInputs";
import { createClassicStudioStitchOverlays } from "./createClassicStudioStitchOverlays";
import { createStudioStitchAvailability } from "./createStudioStitchAvailability";
import { createStudioStitchCtaPlan } from "./createStudioStitchCtaPlan";
import { createStudioStitchMusicPlan } from "./createStudioStitchMusicPlan";
import { createStudioStitchProductGrounding } from "./createStudioStitchProductGrounding";
import { createStudioStitchProviderRequirement } from "./createStudioStitchProviderRequirement";
import { createStudioStitchSegments } from "./createStudioStitchSegments";
import { createStudioStitchTransitions } from "./createStudioStitchTransitions";
import { finalizeStudioStitchRecipe } from "./finalizeStudioStitchRecipe";
import { isStudioStitchClassicHookFamily } from "./isStudioStitchClassicHookFamily";
import { isStudioStitchFrameAligned } from "./isStudioStitchFrameAligned";
import { normalizeStudioStitchText } from "./normalizeStudioStitchText";
import { selectStudioStitchGroundingClaimIds } from "./selectStudioStitchGroundingClaimIds";
import { snapStudioStitchSecondsToFrame } from "./snapStudioStitchSecondsToFrame";
import { STUDIO_STITCH_CANVAS } from "./studioStitchCanvas";
import { STUDIO_STITCH_RECIPE_VERSION } from "./studioStitchRecipeVersion";
import { STUDIO_STITCH_SAFE_AREA } from "./studioStitchSafeArea";

export function planClassicStudioStitchRecipe(
  input: StudioStitchClassicReelPlanInput,
): StudioStitchClassicReelRecipeV1 {
  if (
    !Number.isFinite(input.targetDurationSeconds) ||
    input.targetDurationSeconds < 7 ||
    input.targetDurationSeconds > 15 ||
    !isStudioStitchFrameAligned(input.targetDurationSeconds)
  ) {
    throw new Error(
      "Classic reel duration must be frame-aligned from 7 through 15 seconds.",
    );
  }
  if (!isStudioStitchClassicHookFamily(input.hookFamily)) {
    throw new Error("Classic reel hook family is not supported.");
  }
  if (!Array.isArray(input.cutaways) || input.cutaways.length > 3) {
    throw new Error("Classic reels support no more than three cutaways.");
  }
  assertStudioStitchProviderAvailabilityInputs(input.providerAvailability);
  const id = normalizeStudioStitchText(input.id, "Recipe ID", 240);
  const grounding = createStudioStitchProductGrounding(
    input.product,
    input.creativeBrief,
  );
  const hookText = normalizeStudioStitchText(
    input.hookText ?? input.creativeBrief.hook,
    "Hook text",
    500,
  );
  const supportingText = normalizeStudioStitchText(
    input.supportingText ?? input.creativeBrief.soundOffOverlay,
    "Supporting overlay",
    500,
  );
  const ctaText = normalizeStudioStitchText(
    input.ctaText ??
      input.creativeBrief.closingCta ??
      input.creativeBrief.callToAction,
    "CTA text",
    500,
  );
  const hookDurationSeconds = snapStudioStitchSecondsToFrame(
    Math.min(5, Math.max(3, input.targetDurationSeconds / 3)),
  );
  const remainingDurations = allocateStudioStitchFrameDurations(
    input.targetDurationSeconds - hookDurationSeconds,
    [2, ...input.cutaways.map(() => 1)],
  );
  const segments = createStudioStitchSegments([
    {
      role: "reactionHook",
      source: input.reaction,
      durationSeconds: hookDurationSeconds,
    },
    {
      role: "demoProof",
      source: input.demo,
      durationSeconds: remainingDurations[0],
    },
    ...input.cutaways.map((source, index) => ({
      role: "cutaway" as const,
      source,
      durationSeconds: remainingDurations[index + 1],
    })),
  ]);
  const hookClaimIds = selectStudioStitchGroundingClaimIds(grounding, "hook");
  const supportingClaimIds = selectStudioStitchGroundingClaimIds(
    grounding,
    "supporting",
  );
  const ctaClaimIds = selectStudioStitchGroundingClaimIds(grounding, "cta");
  const textOverlays = createClassicStudioStitchOverlays({
    hookText,
    supportingText,
    ctaText,
    hookEndSeconds: hookDurationSeconds,
    durationSeconds: input.targetDurationSeconds,
    hookClaimIds,
    supportingClaimIds,
    ctaClaimIds,
  });
  const ctaOverlay = textOverlays.find((overlay) => overlay.role === "cta");
  if (!ctaOverlay) {
    throw new Error("Classic reel planning did not produce a CTA overlay.");
  }
  const providerRequirements = [
    createStudioStitchProviderRequirement(
      "reactionFootage",
      "sourceReactionFootage",
      input.providerAvailability,
      true,
    ),
    createStudioStitchProviderRequirement(
      "demoIntelligence",
      "selectDemoMoments",
      input.providerAvailability,
      true,
    ),
    createStudioStitchProviderRequirement(
      "mediaRendering",
      "renderRecipe",
      input.providerAvailability,
      false,
    ),
  ];
  return finalizeStudioStitchRecipe({
    recipeVersion: STUDIO_STITCH_RECIPE_VERSION,
    id,
    productId: grounding.productId,
    pipeline: "classicReel",
    durationSeconds: input.targetDurationSeconds,
    canvas: { ...STUDIO_STITCH_CANVAS },
    safeArea: { ...STUDIO_STITCH_SAFE_AREA },
    grounding,
    hook: { family: input.hookFamily, text: hookText, groundingClaimIds: hookClaimIds },
    segments,
    textOverlays,
    transitions: createStudioStitchTransitions(segments),
    music: createStudioStitchMusicPlan(
      input.musicSource,
      input.musicVolume,
      {
        volume: 0.7,
        targetLufs: null,
        fadeInSeconds: 0.5,
        fadeOutSeconds: 1,
      },
    ),
    cta: createStudioStitchCtaPlan(ctaOverlay),
    providerRequirements,
    availability: createStudioStitchAvailability(providerRequirements),
    voice: null,
    captions: null,
  });
}
