import { z } from "zod";
import { STUDIO_STITCH_CLASSIC_HOOK_FAMILIES } from "@/lib/clipstitchr/studio/stitch/studioStitchClassicHookFamilies";
import { STUDIO_STITCH_TALKING_HOOK_FAMILIES } from "@/lib/clipstitchr/studio/stitch/studioStitchTalkingHookFamilies";

const boundedId = z.string().trim().min(1).max(240);
const boundedCopy = z.string().trim().min(1).max(8_000);
const assetRef = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("videoClip"), videoClipId: boundedId }),
  z.strictObject({ kind: z.literal("stitch"), stitchId: boundedId }),
  z.strictObject({ kind: z.literal("studioOutput"), outputId: boundedId }),
  z.strictObject({ kind: z.literal("studioUpload"), objectKey: z.string().trim().min(1).max(1_000) }),
]);
const sourceAsset = z.strictObject({
  assetId: boundedId,
  source: assetRef,
  sourceDurationSeconds: z.number().finite().positive().max(86_400),
  sourceOffsetSeconds: z.number().finite().nonnegative().max(86_400),
  playbackRate: z.number().finite().min(0.25).max(4),
  creatorContinuityKey: boundedId.nullable(),
});
const creativeBrief = z.strictObject({
  adaptedCaption: boundedCopy.optional(),
  adaptedConcept: boundedCopy.optional(),
  beatScript: z.array(boundedCopy).min(1).max(100),
  callToAction: boundedCopy,
  closingCta: boundedCopy.optional(),
  directionName: boundedCopy,
  footageNeeds: z.array(boundedCopy).max(100),
  hook: boundedCopy,
  onScreenTextByScene: z.array(boundedCopy).max(100).optional(),
  openingReaction: boundedCopy.optional(),
  openingVisual: boundedCopy,
  productProof: boundedCopy,
  productDemonstration: boundedCopy.optional(),
  propsAndInteractions: z.array(boundedCopy).max(100).optional(),
  sceneBySceneDirections: z.array(boundedCopy).max(100).optional(),
  soundOffOverlay: boundedCopy,
  spokenLines: z.array(boundedCopy).max(200).optional(),
});
const common = {
  recipeId: boundedId,
  productId: boundedId,
  idempotencyKey: z.string().trim().min(1).max(200),
  creativeBrief,
  hookText: boundedCopy.max(500).optional(),
  ctaText: boundedCopy.max(500).optional(),
  musicSource: assetRef.nullable(),
  musicVolume: z.number().finite().min(0).max(1).optional(),
};
const wordTiming = z.strictObject({
  word: z.string().trim().min(1).max(100),
  startSeconds: z.number().finite().nonnegative(),
  endSeconds: z.number().finite().positive(),
});

export const studioStitchRecipeRequestSchema = z.discriminatedUnion("pipeline", [
  z.strictObject({
    ...common,
    pipeline: z.literal("classicReel"),
    hookFamily: z.enum(STUDIO_STITCH_CLASSIC_HOOK_FAMILIES),
    supportingText: boundedCopy.max(500).optional(),
    targetDurationSeconds: z.number().finite().min(7).max(15),
    reaction: sourceAsset,
    demo: sourceAsset,
    cutaways: z.array(sourceAsset).max(3),
  }),
  z.strictObject({
    ...common,
    pipeline: z.literal("talkingVideo"),
    hookFamily: z.enum(STUDIO_STITCH_TALKING_HOOK_FAMILIES),
    voiceScript: boundedCopy.optional(),
    targetDurationSeconds: z.number().finite().min(20).max(30),
    reactionSources: z.array(sourceAsset).length(5),
    demoSources: z.array(sourceAsset).length(2),
    voice: z.strictObject({
      voiceId: boundedId,
      voiceName: boundedId,
      modelId: boundedId,
      speed: z.number().finite().min(0.5).max(2),
      stability: z.number().finite().min(0).max(1),
      similarityBoost: z.number().finite().min(0).max(1),
      style: z.number().finite().min(0).max(1),
      rawDurationSeconds: z.number().finite().positive().max(300).nullable(),
      wordTimings: z.array(wordTiming).min(1).max(1_000).nullable(),
    }),
    emphasisWords: z.array(z.string().trim().min(1).max(100)).max(50),
  }),
]);

export type StudioStitchRecipeRequest = z.infer<
  typeof studioStitchRecipeRequestSchema
>;
