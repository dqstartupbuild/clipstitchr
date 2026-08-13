import type { StudioStitchRecipeRequest } from "@/lib/clipstitchr/server/studio/stitch/studioStitchRecipeRequestSchema";
import type { StudioEditorMediaSourceDescriptor } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { StudioStitchCreativeBriefOption } from "./StudioStitchCreativeBriefOption";
import type { StudioStitchRecipeDraft } from "./StudioStitchRecipeDraft";
import { createStudioStitchClientId } from "./createStudioStitchClientId";
import { createStudioStitchSourceAssetInput } from "./createStudioStitchSourceAssetInput";
import { requireStudioStitchSources } from "./requireStudioStitchSources";

export function createStudioStitchRecipeRequest(input: {
  readonly productId: string;
  readonly briefOption: StudioStitchCreativeBriefOption;
  readonly draft: StudioStitchRecipeDraft;
  readonly sources: readonly StudioEditorMediaSourceDescriptor[];
  readonly musicTracks: readonly SharedMusicTrack[];
}): StudioStitchRecipeRequest {
  const { draft } = input;
  const recipeId = createStudioStitchClientId("studio_recipe");
  const musicTrack = input.musicTracks.find(
    (track) => track.id === draft.musicTrackId,
  );
  const musicSource = musicTrack
    ? ({ kind: "studioUpload", objectKey: musicTrack.audioObject.key } as const)
    : null;

  if (draft.pipeline === "classicReel") {
    const reaction = requireStudioStitchSources(
      draft.reactionSourceIds,
      input.sources,
      1,
      "reaction source",
    )[0];
    const demo = requireStudioStitchSources(
      draft.demoSourceIds,
      input.sources,
      1,
      "demo source",
    )[0];
    const cutaways = draft.cutawaySourceIds.map((id) => {
      const source = input.sources.find((candidate) => candidate.id === id);
      if (!source) throw new Error("A selected cutaway is no longer available.");
      return createStudioStitchSourceAssetInput(source, null);
    });
    return {
      pipeline: "classicReel",
      recipeId,
      productId: input.productId,
      idempotencyKey: `create_${recipeId}`,
      creativeBrief: input.briefOption.brief,
      hookFamily: draft.classicHookFamily,
      hookText: draft.hookText || undefined,
      supportingText: draft.supportingText || undefined,
      ctaText: draft.ctaText || undefined,
      targetDurationSeconds: draft.durationSeconds,
      reaction: createStudioStitchSourceAssetInput(
        reaction,
        draft.creatorContinuityKey.trim() || "classic_creator",
      ),
      demo: createStudioStitchSourceAssetInput(demo, null),
      cutaways,
      musicSource,
      musicVolume: draft.musicVolume,
    };
  }

  const continuityKey = draft.creatorContinuityKey.trim();
  if (!continuityKey) {
    throw new Error("Name the on-camera creator so all five reaction beats stay continuous.");
  }
  const reactionSources = requireStudioStitchSources(
    draft.reactionSourceIds,
    input.sources,
    5,
    "reaction sources",
  );
  const demoSources = requireStudioStitchSources(
    draft.demoSourceIds,
    input.sources,
    2,
    "demo sources",
  );
  const script = draft.voiceScript.trim() || input.briefOption.brief.spokenLines?.join(" ") || input.briefOption.brief.beatScript.join(" ");

  return {
    pipeline: "talkingVideo",
    recipeId,
    productId: input.productId,
    idempotencyKey: `create_${recipeId}`,
    creativeBrief: input.briefOption.brief,
    hookFamily: draft.talkingHookFamily,
    hookText: draft.hookText || undefined,
    voiceScript: script,
    ctaText: draft.ctaText || undefined,
    targetDurationSeconds: draft.durationSeconds,
    reactionSources: reactionSources.map((source) =>
      createStudioStitchSourceAssetInput(source, continuityKey),
    ) as [
      ReturnType<typeof createStudioStitchSourceAssetInput>,
      ReturnType<typeof createStudioStitchSourceAssetInput>,
      ReturnType<typeof createStudioStitchSourceAssetInput>,
      ReturnType<typeof createStudioStitchSourceAssetInput>,
      ReturnType<typeof createStudioStitchSourceAssetInput>,
    ],
    demoSources: demoSources.map((source) =>
      createStudioStitchSourceAssetInput(source, null),
    ) as [
      ReturnType<typeof createStudioStitchSourceAssetInput>,
      ReturnType<typeof createStudioStitchSourceAssetInput>,
    ],
    voice: {
      voiceId: draft.voiceId,
      voiceName: draft.voiceName,
      modelId: draft.voiceModelId,
      speed: 1,
      stability: 0.65,
      similarityBoost: 0.8,
      style: 0.2,
      rawDurationSeconds: null,
      wordTimings: null,
    },
    emphasisWords: draft.emphasisWords
      .split(",")
      .map((word) => word.trim())
      .filter(Boolean),
    musicSource,
    musicVolume: draft.musicVolume,
  };
}
