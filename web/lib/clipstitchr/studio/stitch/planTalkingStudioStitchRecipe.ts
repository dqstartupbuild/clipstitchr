import type { StudioStitchTalkingVideoPlanInput } from "../../types/studioStitch/StudioStitchTalkingVideoPlanInput";
import type { StudioStitchTalkingVideoRecipeV1 } from "../../types/studioStitch/StudioStitchTalkingVideoRecipeV1";
import { allocateStudioStitchFrameDurations } from "./allocateStudioStitchFrameDurations";
import { assertStudioStitchProviderAvailabilityInputs } from "./assertStudioStitchProviderAvailabilityInputs";
import { assertTalkingStudioStitchContinuity } from "./assertTalkingStudioStitchContinuity";
import { createStudioStitchAvailability } from "./createStudioStitchAvailability";
import { createStudioStitchCaptionOverlays } from "./createStudioStitchCaptionOverlays";
import { createStudioStitchCaptionTimingContract } from "./createStudioStitchCaptionTimingContract";
import { createStudioStitchCtaPlan } from "./createStudioStitchCtaPlan";
import { createStudioStitchMusicPlan } from "./createStudioStitchMusicPlan";
import { createStudioStitchProductGrounding } from "./createStudioStitchProductGrounding";
import { createStudioStitchProviderRequirement } from "./createStudioStitchProviderRequirement";
import { createStudioStitchSegments } from "./createStudioStitchSegments";
import { createStudioStitchTransitions } from "./createStudioStitchTransitions";
import { createStudioStitchVoicePlan } from "./createStudioStitchVoicePlan";
import { createTalkingStudioStitchCtaOverlay } from "./createTalkingStudioStitchCtaOverlay";
import { createTalkingStudioStitchHookOverlay } from "./createTalkingStudioStitchHookOverlay";
import { finalizeStudioStitchRecipe } from "./finalizeStudioStitchRecipe";
import { isStudioStitchFrameAligned } from "./isStudioStitchFrameAligned";
import { isStudioStitchTalkingHookFamily } from "./isStudioStitchTalkingHookFamily";
import { normalizeStudioStitchText } from "./normalizeStudioStitchText";
import { selectStudioStitchGroundingClaimIds } from "./selectStudioStitchGroundingClaimIds";
import { STUDIO_STITCH_CANVAS } from "./studioStitchCanvas";
import { STUDIO_STITCH_RECIPE_VERSION } from "./studioStitchRecipeVersion";
import { STUDIO_STITCH_SAFE_AREA } from "./studioStitchSafeArea";

export function planTalkingStudioStitchRecipe(
  input: StudioStitchTalkingVideoPlanInput,
): StudioStitchTalkingVideoRecipeV1 {
  if (
    !Number.isFinite(input.targetDurationSeconds) ||
    input.targetDurationSeconds < 20 ||
    input.targetDurationSeconds > 30 ||
    !isStudioStitchFrameAligned(input.targetDurationSeconds)
  ) {
    throw new Error(
      "Talking video duration must be frame-aligned from 20 through 30 seconds.",
    );
  }
  if (!isStudioStitchTalkingHookFamily(input.hookFamily)) {
    throw new Error("Talking video hook family is not supported.");
  }
  assertTalkingStudioStitchContinuity(input.reactionSources);
  if (input.demoSources.length !== 2) {
    throw new Error("Talking videos require exactly two demo source beats.");
  }
  if (!Array.isArray(input.emphasisWords) || input.emphasisWords.length > 50) {
    throw new Error("Talking videos support no more than 50 emphasis words.");
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
  const voiceScript = normalizeStudioStitchText(
    input.voiceScript ??
      input.creativeBrief.spokenLines?.join(" ") ??
      input.creativeBrief.beatScript.join(" "),
    "Voice script",
    8_000,
  );
  const ctaText = normalizeStudioStitchText(
    input.ctaText ??
      input.creativeBrief.closingCta ??
      input.creativeBrief.callToAction,
    "CTA text",
    500,
  );
  const nonCtaDurations = allocateStudioStitchFrameDurations(
    input.targetDurationSeconds - 4,
    [3, 3, 3, 6, 6, 5],
  );
  const segments = createStudioStitchSegments([
    { role: "reactionHook", source: input.reactionSources[0], durationSeconds: nonCtaDurations[0] },
    { role: "reactionContext", source: input.reactionSources[1], durationSeconds: nonCtaDurations[1] },
    { role: "reactionBridge", source: input.reactionSources[2], durationSeconds: nonCtaDurations[2] },
    { role: "demoSetup", source: input.demoSources[0], durationSeconds: nonCtaDurations[3] },
    { role: "demoProof", source: input.demoSources[1], durationSeconds: nonCtaDurations[4] },
    { role: "reactionSupport", source: input.reactionSources[3], durationSeconds: nonCtaDurations[5] },
    { role: "ctaReaction", source: input.reactionSources[4], durationSeconds: 4 },
  ]);
  const hookClaimIds = selectStudioStitchGroundingClaimIds(grounding, "hook");
  const ctaClaimIds = selectStudioStitchGroundingClaimIds(grounding, "cta");
  const voiceClaimIds = selectStudioStitchGroundingClaimIds(grounding, "voice");
  const voice = createStudioStitchVoicePlan(
    input.voice,
    voiceScript,
    input.targetDurationSeconds,
    voiceClaimIds,
  );
  const captionTimingContract = createStudioStitchCaptionTimingContract(
    input.targetDurationSeconds,
  );
  const captionOverlays = createStudioStitchCaptionOverlays({
    wordTimings: voice.timelineWordTimings,
    emphasisWords: input.emphasisWords,
    captionCutoffSeconds: captionTimingContract.captionCutoffSeconds,
    groundingClaimIds: voiceClaimIds,
  });
  const hookOverlay = createTalkingStudioStitchHookOverlay(
    hookText,
    segments[0].timelineDurationSeconds,
    hookClaimIds,
  );
  const ctaOverlay = createTalkingStudioStitchCtaOverlay(
    ctaText,
    input.targetDurationSeconds,
    ctaClaimIds,
  );
  const textOverlays = [hookOverlay, ...captionOverlays, ctaOverlay];
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
      "voiceWordTimings",
      "generateVoiceWithWordTimings",
      input.providerAvailability,
      voice.timingState === "provided",
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
    pipeline: "talkingVideo",
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
        volume: 0.5,
        targetLufs: -16,
        fadeInSeconds: 0.4,
        fadeOutSeconds: 1.5,
      },
    ),
    cta: createStudioStitchCtaPlan(ctaOverlay),
    providerRequirements,
    availability: createStudioStitchAvailability(providerRequirements),
    voice,
    captions: {
      state: voice.timingState === "provided" ? "ready" : "pendingWordTimings",
      timingContract: captionTimingContract,
      cueOverlayIds: captionOverlays.map((overlay) => overlay.id),
    },
  });
}
