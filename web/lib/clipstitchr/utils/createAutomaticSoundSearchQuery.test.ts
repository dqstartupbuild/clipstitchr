import { describe, expect, it } from "vitest";
import { createAutomaticSoundSearchQuery } from "@/lib/clipstitchr/utils/createAutomaticSoundSearchQuery";

describe("createAutomaticSoundSearchQuery", () => {
  it("builds a concise TikTok search query from post context", () => {
    expect(
      createAutomaticSoundSearchQuery({
        caption: "The faster way to plan your launch. #founders",
        context: "A launch calendar for solo founders.",
        sourceTitle: "Launch Kit Swipe",
      }),
    ).toBe("launch kit swipe faster way trending sound");
  });

  it("falls back when there is no useful context", () => {
    expect(
      createAutomaticSoundSearchQuery({
        sourceTitle: "the and for",
      }),
    ).toBe("viral product demo sound");
  });
});
