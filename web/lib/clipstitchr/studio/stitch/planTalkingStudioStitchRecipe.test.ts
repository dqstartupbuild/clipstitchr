import { describe, expect, it } from "vitest";
import { planTalkingStudioStitchRecipe } from "./planTalkingStudioStitchRecipe";
import { createStudioStitchTestTalkingInput } from "./test/createStudioStitchTestTalkingInput";

describe("planTalkingStudioStitchRecipe", () => {
  it("plans the seven-beat talking cadence with fitted word captions and CTA cutoff", () => {
    const recipe = planTalkingStudioStitchRecipe(
      createStudioStitchTestTalkingInput(),
    );

    expect(recipe.segments.map((segment) => segment.role)).toEqual([
      "reactionHook",
      "reactionContext",
      "reactionBridge",
      "demoSetup",
      "demoProof",
      "reactionSupport",
      "ctaReaction",
    ]);
    expect(recipe.segments.map((segment) => segment.timelineDurationSeconds)).toEqual([
      3,
      3,
      3,
      6,
      6,
      5,
      4,
    ]);
    expect(recipe.voice.timingState).toBe("provided");
    expect(recipe.voice.tempoFactor).toBe(1);
    expect(recipe.voice.targetWordCountMinimum).toBe(75);
    expect(recipe.voice.targetWordCountMaximum).toBe(82);
    expect(recipe.voice.actualWordCount).toBe(78);
    expect(recipe.captions.timingContract.captionCutoffSeconds).toBe(26);
    const captions = recipe.textOverlays.filter(
      (overlay) => overlay.role === "caption",
    );
    expect(captions.length).toBeGreaterThan(0);
    expect(captions.every((caption) => caption.endSeconds <= 26)).toBe(true);
    expect(captions.every((caption) => caption.text.split(/\s+/).length <= 3)).toBe(
      true,
    );
    expect(captions.some((caption) => caption.emphasis)).toBe(true);
    expect(recipe.cta).toMatchObject({ startSeconds: 26, endSeconds: 30 });
    expect(recipe.music).toMatchObject({
      volume: 0.5,
      targetLufs: -16,
      fadeInSeconds: 0.4,
      fadeOutSeconds: 1.5,
      loopToDuration: true,
    });
    expect(recipe.availability.state).toBe("ready");
  });

  it("makes missing voice timings and rendering capability explicit", () => {
    const input = createStudioStitchTestTalkingInput();
    const recipe = planTalkingStudioStitchRecipe({
      ...input,
      voice: {
        ...input.voice,
        rawDurationSeconds: null,
        wordTimings: null,
      },
      providerAvailability: input.providerAvailability.map((availability) =>
        availability.capability === "voiceWordTimings"
          ? { ...availability, state: "unavailable" as const }
          : availability.capability === "mediaRendering"
            ? { ...availability, state: "unknown" as const }
            : availability,
      ),
    });

    expect(recipe.voice.timingState).toBe("pendingProvider");
    expect(recipe.captions).toEqual(
      expect.objectContaining({
        state: "pendingWordTimings",
        cueOverlayIds: [],
      }),
    );
    expect(recipe.availability).toEqual({
      state: "unavailable",
      unavailableCapabilities: ["voiceWordTimings", "mediaRendering"],
    });
  });

  it("scales raw voice timestamps and the seven beats to a 20-second target", () => {
    const recipe = planTalkingStudioStitchRecipe({
      ...createStudioStitchTestTalkingInput(),
      targetDurationSeconds: 20,
    });

    expect(recipe.voice.tempoFactor).toBe(1.5);
    expect(recipe.voice.timelineWordTimings[0]).toEqual({
      word: "proof1",
      startSeconds: 0,
      endSeconds: 0.166667,
    });
    expect(
      recipe.segments.reduce(
        (duration, segment) => duration + segment.timelineDurationSeconds,
        0,
      ),
    ).toBeCloseTo(20, 10);
    expect(recipe.segments.at(-1)).toMatchObject({
      role: "ctaReaction",
      timelineStartSeconds: 16,
      timelineDurationSeconds: 4,
    });
    expect(recipe.captions.timingContract.captionCutoffSeconds).toBe(16);
    expect(recipe.voice.targetWordCountMinimum).toBe(50);
    expect(recipe.voice.targetWordCountMaximum).toBe(55);
  });

  it("rejects reaction footage that breaks creator continuity", () => {
    const input = createStudioStitchTestTalkingInput();
    expect(() =>
      planTalkingStudioStitchRecipe({
        ...input,
        reactionSources: input.reactionSources.map((source, index) =>
          index === 2
            ? { ...source, creatorContinuityKey: "creator_b" }
            : source,
        ),
      }),
    ).toThrow(/one creator continuity key/);
  });
});
