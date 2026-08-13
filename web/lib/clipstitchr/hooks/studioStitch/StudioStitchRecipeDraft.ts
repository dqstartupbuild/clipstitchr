import type { StudioStitchClassicHookFamily } from "@/lib/clipstitchr/types/studioStitch/StudioStitchClassicHookFamily";
import type { StudioStitchTalkingHookFamily } from "@/lib/clipstitchr/types/studioStitch/StudioStitchTalkingHookFamily";

export type StudioStitchRecipeDraft = {
  pipeline: "classicReel" | "talkingVideo";
  classicHookFamily: StudioStitchClassicHookFamily;
  talkingHookFamily: StudioStitchTalkingHookFamily;
  durationSeconds: number;
  hookText: string;
  supportingText: string;
  ctaText: string;
  reactionSourceIds: string[];
  demoSourceIds: string[];
  cutawaySourceIds: string[];
  creatorContinuityKey: string;
  voiceScript: string;
  voiceId: string;
  voiceName: string;
  voiceModelId: string;
  emphasisWords: string;
  musicTrackId: string;
  musicVolume: number;
};
