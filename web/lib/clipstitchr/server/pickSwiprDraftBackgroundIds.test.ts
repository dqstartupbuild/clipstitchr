import { describe, expect, it } from "vitest";
import { pickSwiprDraftBackgroundIds } from "@/lib/clipstitchr/server/pickSwiprDraftBackgroundIds";

describe("pickSwiprDraftBackgroundIds", () => {
  it("uses every available background before repeating", () => {
    const backgroundIds = pickSwiprDraftBackgroundIds({
      availableBackgroundIds: ["background_1", "background_2", "background_3"],
      random: () => 0,
      slideCount: 3,
    });

    expect(backgroundIds).toHaveLength(3);
    expect(new Set(backgroundIds)).toEqual(
      new Set(["background_1", "background_2", "background_3"]),
    );
  });

  it("honors a preferred first background without duplicating it early", () => {
    const backgroundIds = pickSwiprDraftBackgroundIds({
      availableBackgroundIds: ["background_1", "background_2", "background_3"],
      preferredFirstBackgroundId: "background_2",
      random: () => 0,
      slideCount: 3,
    });

    expect(backgroundIds[0]).toBe("background_2");
    expect(new Set(backgroundIds)).toEqual(
      new Set(["background_1", "background_2", "background_3"]),
    );
  });

  it("cycles small packs without adjacent repeats when variation is possible", () => {
    const backgroundIds = pickSwiprDraftBackgroundIds({
      availableBackgroundIds: ["background_1", "background_2"],
      random: () => 0,
      slideCount: 8,
    });

    expect(backgroundIds).toHaveLength(8);
    expect(new Set(backgroundIds)).toEqual(
      new Set(["background_1", "background_2"]),
    );
    expect(
      backgroundIds.every((backgroundId, index) => {
        return index === 0 || backgroundId !== backgroundIds[index - 1];
      }),
    ).toBe(true);
  });

  it("returns an empty selection when no backgrounds are available", () => {
    expect(
      pickSwiprDraftBackgroundIds({
        availableBackgroundIds: [],
        slideCount: 8,
      }),
    ).toEqual([]);
  });
});
