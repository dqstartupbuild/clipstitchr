import { describe, expect, it } from "vitest";
import { getCliprGenerationStrategy } from "@/lib/clipstitchr/utils/getCliprGenerationStrategy";

describe("getCliprGenerationStrategy", () => {
  it("uses one scene for short single-shot formats", () => {
    expect(
      getCliprGenerationStrategy({
        contentType: "text-shot",
        durationSeconds: 30,
      }),
    ).toEqual({
      sceneCount: 1,
      sceneDurationSeconds: 20,
      strategy: "single-video",
    });
  });

  it("splits thirty second generated reels into three scenes", () => {
    expect(
      getCliprGenerationStrategy({
        contentType: "b-roll-reel",
        durationSeconds: 30,
      }),
    ).toEqual({
      sceneCount: 3,
      sceneDurationSeconds: 10,
      strategy: "multi-scene",
    });
  });

  it("splits sixty second generated formats into six scenes", () => {
    expect(
      getCliprGenerationStrategy({
        contentType: "value-video",
        durationSeconds: 60,
      }),
    ).toEqual({
      sceneCount: 6,
      sceneDurationSeconds: 10,
      strategy: "multi-scene",
    });
  });
});
