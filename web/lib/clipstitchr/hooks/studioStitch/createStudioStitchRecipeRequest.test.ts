import { describe, expect, it } from "vitest";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { StudioEditorMediaSourceDescriptor } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";
import type { StudioStitchCreativeBriefOption } from "./StudioStitchCreativeBriefOption";
import { createDefaultStudioStitchRecipeDraft } from "./createDefaultStudioStitchRecipeDraft";
import { createStudioStitchRecipeRequest } from "./createStudioStitchRecipeRequest";

const briefOption: StudioStitchCreativeBriefOption = {
  id: "brief_1",
  source: "product",
  title: "Proof direction",
  note: "Grounded in Product",
  brief: {
    beatScript: ["Open on the friction", "Show the proof", "Invite the next step"],
    callToAction: "Try the Product.",
    closingCta: "See it work.",
    directionName: "Proof first",
    footageNeeds: ["Reaction", "Demo"],
    hook: "This used to take all afternoon.",
    openingVisual: "Open on the finished result.",
    productProof: "The saved Product proof.",
    soundOffOverlay: "From stuck to finished",
    spokenLines: ["This used to take all afternoon.", "Now it takes one pass."],
  },
};

const sources: StudioEditorMediaSourceDescriptor[] = Array.from(
  { length: 7 },
  (_, index) => ({
    kind: index === 6 ? "stitch" : "videoClip",
    id: `source_${index + 1}`,
    name: `Source ${index + 1}`,
    durationSeconds: 8 + index,
    width: 1080,
    height: 1920,
    hasAudio: true,
    objectKey: `products/product_1/source_${index + 1}.mp4`,
  }),
);

const musicTrack = {
  id: "music_1",
  title: "Quiet pulse",
  durationSeconds: 60,
  audioObject: { key: "music/quiet-pulse.mp3" },
} as SharedMusicTrack;

describe("createStudioStitchRecipeRequest", () => {
  it("maps a classic draft into an immutable, Product-scoped request", () => {
    const draft = {
      ...createDefaultStudioStitchRecipeDraft(),
      reactionSourceIds: ["source_1"],
      demoSourceIds: ["source_2"],
      cutawaySourceIds: ["source_3"],
      hookText: "Watch the result first.",
      musicTrackId: "music_1",
      musicVolume: 0.35,
    };

    const request = createStudioStitchRecipeRequest({
      productId: "product_1",
      briefOption,
      draft,
      sources,
      musicTracks: [musicTrack],
    });

    expect(request.pipeline).toBe("classicReel");
    if (request.pipeline !== "classicReel") throw new Error("Expected classic request.");
    expect(request.productId).toBe("product_1");
    expect(request.recipeId).toMatch(/^studio_recipe_/);
    expect(request.idempotencyKey).toBe(`create_${request.recipeId}`);
    expect(request.reaction.source).toEqual({
      kind: "videoClip",
      videoClipId: "source_1",
    });
    expect(request.reaction.creatorContinuityKey).toBe("classic_creator");
    expect(request.demo.source).toEqual({
      kind: "videoClip",
      videoClipId: "source_2",
    });
    expect(request.cutaways).toHaveLength(1);
    expect(request.musicSource).toEqual({
      kind: "studioUpload",
      objectKey: "music/quiet-pulse.mp3",
    });
    expect(request.hookText).toBe("Watch the result first.");
  });

  it("maps the strict five-reaction, two-demo talking contract", () => {
    const draft = {
      ...createDefaultStudioStitchRecipeDraft(),
      pipeline: "talkingVideo" as const,
      durationSeconds: 25,
      creatorContinuityKey: "creator_jules",
      reactionSourceIds: sources.slice(0, 5).map((source) => source.id),
      demoSourceIds: sources.slice(5, 7).map((source) => source.id),
      emphasisWords: "proof, today, proof",
    };

    const request = createStudioStitchRecipeRequest({
      productId: "product_1",
      briefOption,
      draft,
      sources,
      musicTracks: [],
    });

    expect(request.pipeline).toBe("talkingVideo");
    if (request.pipeline !== "talkingVideo") throw new Error("Expected talking request.");
    expect(request.reactionSources).toHaveLength(5);
    expect(request.reactionSources.every(
      (source) => source.creatorContinuityKey === "creator_jules",
    )).toBe(true);
    expect(request.demoSources).toHaveLength(2);
    expect(request.demoSources[1].source).toEqual({
      kind: "stitch",
      stitchId: "source_7",
    });
    expect(request.voiceScript).toBe(
      "This used to take all afternoon. Now it takes one pass.",
    );
    expect(request.voice.wordTimings).toBeNull();
    expect(request.voice.rawDurationSeconds).toBeNull();
    expect(request.emphasisWords).toEqual(["proof", "today", "proof"]);
  });

  it("rejects a talking draft without creator continuity", () => {
    const draft = {
      ...createDefaultStudioStitchRecipeDraft(),
      pipeline: "talkingVideo" as const,
      durationSeconds: 25,
      reactionSourceIds: sources.slice(0, 5).map((source) => source.id),
      demoSourceIds: sources.slice(5, 7).map((source) => source.id),
    };

    expect(() =>
      createStudioStitchRecipeRequest({
        productId: "product_1",
        briefOption,
        draft,
        sources,
        musicTracks: [],
      }),
    ).toThrow("Name the on-camera creator");
  });
});
