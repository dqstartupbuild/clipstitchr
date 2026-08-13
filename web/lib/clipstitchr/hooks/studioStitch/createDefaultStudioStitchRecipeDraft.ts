import type { StudioStitchRecipeDraft } from "./StudioStitchRecipeDraft";

export function createDefaultStudioStitchRecipeDraft(
  initialReactionSourceId?: string,
): StudioStitchRecipeDraft {
  return {
    pipeline: "classicReel",
    classicHookFamily: "whenRelatable",
    talkingHookFamily: "genuineShock",
    durationSeconds: 15,
    hookText: "",
    supportingText: "",
    ctaText: "",
    reactionSourceIds: initialReactionSourceId
      ? [initialReactionSourceId]
      : [],
    demoSourceIds: [],
    cutawaySourceIds: [],
    creatorContinuityKey: "",
    voiceScript: "",
    voiceId: "studio-voice",
    voiceName: "Studio voice",
    voiceModelId: "eleven_multilingual_v2",
    emphasisWords: "",
    musicTrackId: "",
    musicVolume: 0.5,
  };
}
