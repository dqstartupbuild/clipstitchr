import type { StudioStitchClassicReelPlanInput } from "../../../types/studioStitch/StudioStitchClassicReelPlanInput";

export function createStudioStitchTestClassicInput(
  id = "classic_recipe_1",
): StudioStitchClassicReelPlanInput {
  return {
    id,
    product: {
      id: "product_1",
      name: "Pocket Proof",
      productDetails: "A pocket-sized product demo recorder.",
      audienceDetails: "Creators who need concise product proof.",
      emotionalNarrative: "Turn product confidence into visible proof.",
      inferredProblem: "Product claims feel abstract without a demo.",
      inferredPainPoints: ["Slow editing", "Weak proof"],
      createdAt: "2026-08-12T00:00:00.000Z",
      updatedAt: "2026-08-12T00:00:00.000Z",
    },
    creativeBrief: {
      beatScript: ["Show the reaction", "Prove the result"],
      callToAction: "Try Pocket Proof",
      directionName: "Proof first",
      footageNeeds: ["Reaction", "Demo"],
      hook: "When the proof finally speaks for itself",
      openingVisual: "Creator reacts to the result",
      productProof: "Records a concise, visible product demonstration.",
      soundOffOverlay: "See the result in seconds",
    },
    hookFamily: "whenRelatable",
    targetDurationSeconds: 15,
    reaction: {
      assetId: "reaction_1",
      source: { kind: "videoClip", videoClipId: "video_reaction_1" },
      sourceDurationSeconds: 20,
      sourceOffsetSeconds: 0,
      playbackRate: 1,
      creatorContinuityKey: "creator_a",
    },
    demo: {
      assetId: "demo_1",
      source: { kind: "videoClip", videoClipId: "video_demo_1" },
      sourceDurationSeconds: 20,
      sourceOffsetSeconds: 0,
      playbackRate: 1,
      creatorContinuityKey: null,
    },
    cutaways: [
      {
        assetId: "cutaway_1",
        source: { kind: "studioUpload", objectKey: "products/cutaway_1.mp4" },
        sourceDurationSeconds: 20,
        sourceOffsetSeconds: 0,
        playbackRate: 1,
        creatorContinuityKey: null,
      },
    ],
    musicSource: { kind: "studioUpload", objectKey: "music/bed_1.mp3" },
    providerAvailability: [
      {
        capability: "reactionFootage",
        state: "unavailable",
        providerId: null,
        reason: "No acquisition provider configured.",
      },
      {
        capability: "demoIntelligence",
        state: "unavailable",
        providerId: null,
        reason: "No analysis provider configured.",
      },
      {
        capability: "mediaRendering",
        state: "available",
        providerId: "media-worker",
        reason: null,
      },
    ],
  };
}
