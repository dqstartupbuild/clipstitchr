import type { StudioStitchTalkingVideoPlanInput } from "../../../types/studioStitch/StudioStitchTalkingVideoPlanInput";

export function createStudioStitchTestTalkingInput(
  id = "talking_recipe_1",
): StudioStitchTalkingVideoPlanInput {
  const words = Array.from({ length: 78 }, (_, index) =>
    index % 9 === 8 ? `proof${index + 1}.` : `proof${index + 1}`,
  );
  const reactionSources = Array.from({ length: 5 }, (_, index) => ({
    assetId: `reaction_${index + 1}`,
    source: {
      kind: "videoClip" as const,
      videoClipId: `video_reaction_${index + 1}`,
    },
    sourceDurationSeconds: 20,
    sourceOffsetSeconds: 0,
    playbackRate: 1,
    creatorContinuityKey: "creator_a",
  }));
  const demoSources = Array.from({ length: 2 }, (_, index) => ({
    assetId: `demo_${index + 1}`,
    source: {
      kind: "videoClip" as const,
      videoClipId: `video_demo_${index + 1}`,
    },
    sourceDurationSeconds: 20,
    sourceOffsetSeconds: 0,
    playbackRate: 1,
    creatorContinuityKey: null,
  }));
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
      beatScript: words,
      callToAction: "Try Pocket Proof",
      closingCta: "Record your proof today",
      directionName: "Proof first",
      footageNeeds: ["One creator", "Two demos"],
      hook: "I thought this result was staged",
      openingVisual: "Creator reacts to the result",
      productProof: "Records a concise, visible product demonstration.",
      soundOffOverlay: "Watch the proof",
      spokenLines: words,
    },
    hookFamily: "genuineShock",
    targetDurationSeconds: 30,
    reactionSources,
    demoSources,
    voice: {
      voiceId: "voice_1",
      voiceName: "Creator A",
      modelId: "voice-model-with-timestamps",
      speed: 1.05,
      stability: 0.65,
      similarityBoost: 0.8,
      style: 0.2,
      rawDurationSeconds: 30,
      wordTimings: words.map((word, index) => ({
        word,
        startSeconds: Number((index * 0.35).toFixed(2)),
        endSeconds: Number((index * 0.35 + 0.25).toFixed(2)),
      })),
    },
    emphasisWords: ["proof10", "proof20"],
    musicSource: { kind: "studioUpload", objectKey: "music/bed_1.mp3" },
    providerAvailability: [
      {
        capability: "reactionFootage",
        state: "available",
        providerId: "reaction-provider",
        reason: null,
      },
      {
        capability: "demoIntelligence",
        state: "available",
        providerId: "demo-provider",
        reason: null,
      },
      {
        capability: "voiceWordTimings",
        state: "available",
        providerId: "voice-provider",
        reason: null,
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
