import { describe, expect, it } from "vitest";
import { planTalkingStudioStitchRecipe } from "../../lib/clipstitchr/studio/stitch/planTalkingStudioStitchRecipe";
import { createStudioStitchTestTalkingInput } from "../../lib/clipstitchr/studio/stitch/test/createStudioStitchTestTalkingInput";
import { buildStudioReelProviderIntents } from "./buildStudioReelProviderIntents";
import { getStudioReelRunStatusFromIntents } from "./getStudioReelRunStatusFromIntents";

const readiness = [
  {
    provider: "dansugc" as const,
    capability: "reactionFootage" as const,
    state: "configured" as const,
    reason: null,
  },
  {
    provider: "gemini" as const,
    capability: "demoIntelligence" as const,
    state: "unavailable" as const,
    reason: "GEMINI_API_KEY is not configured.",
  },
  {
    provider: "elevenlabs" as const,
    capability: "voiceWordTimings" as const,
    state: "configured" as const,
    reason: null,
  },
  {
    provider: "render" as const,
    capability: "mediaRendering" as const,
    state: "configured" as const,
    reason: null,
  },
];

describe("buildStudioReelProviderIntents", () => {
  it("separates paid intent, unavailable, and input-satisfied states", () => {
    const recipe = planTalkingStudioStitchRecipe(
      createStudioStitchTestTalkingInput(),
    );
    const intents = buildStudioReelProviderIntents([recipe], readiness);

    expect(intents).toEqual([
      expect.objectContaining({
        provider: "dansugc",
        state: "satisfiedByInput",
        recipeCount: 0,
      }),
      expect.objectContaining({
        provider: "gemini",
        state: "satisfiedByInput",
        recipeCount: 0,
      }),
      expect.objectContaining({
        provider: "elevenlabs",
        state: "satisfiedByInput",
        recipeCount: 0,
      }),
      expect.objectContaining({
        provider: "render",
        state: "intentReady",
        recipeCount: 1,
      }),
    ]);
    expect(getStudioReelRunStatusFromIntents(intents)).toBe("intentReady");
  });

  it("blocks the durable run when a required provider is unavailable", () => {
    const recipe = planTalkingStudioStitchRecipe({
      ...createStudioStitchTestTalkingInput(),
      voice: {
        ...createStudioStitchTestTalkingInput().voice,
        rawDurationSeconds: null,
        wordTimings: null,
      },
    });
    const intents = buildStudioReelProviderIntents([recipe], readiness);
    const gemini = intents.find((intent) => intent.provider === "gemini");
    const elevenlabs = intents.find(
      (intent) => intent.provider === "elevenlabs",
    );

    expect(gemini?.state).toBe("satisfiedByInput");
    expect(elevenlabs).toMatchObject({
      state: "intentReady",
      recipeCount: 1,
    });
    expect(getStudioReelRunStatusFromIntents(intents)).toBe("intentReady");

    const unavailableIntents = buildStudioReelProviderIntents(
      [recipe],
      readiness.map((provider) =>
        provider.provider === "elevenlabs"
          ? {
              ...provider,
              state: "unavailable" as const,
              reason: "ELEVENLABS_API_KEY is not configured.",
            }
          : provider,
      ),
    );
    expect(getStudioReelRunStatusFromIntents(unavailableIntents)).toBe(
      "blocked",
    );
  });
});
