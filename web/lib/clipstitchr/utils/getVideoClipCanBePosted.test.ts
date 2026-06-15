import { describe, expect, it } from "vitest";
import { getVideoClipCanBePosted } from "@/lib/clipstitchr/utils/getVideoClipCanBePosted";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

describe("getVideoClipCanBePosted", () => {
  it("only allows script Clipr clips", () => {
    const baseClip = {
      clipType: "ugc",
      id: "clip_1",
      name: "Clip",
    } as unknown as VideoClipMetadata;

    expect(
      getVideoClipCanBePosted({
        ...baseClip,
        cliprMetadata: {
          generationMode: "script",
        },
      } as unknown as VideoClipMetadata),
    ).toBe(true);
    expect(
      getVideoClipCanBePosted({
        ...baseClip,
        cliprMetadata: {},
      } as unknown as VideoClipMetadata),
    ).toBe(true);
    expect(
      getVideoClipCanBePosted({
        ...baseClip,
        cliprMetadata: {
          generationMode: "reaction",
        },
      } as unknown as VideoClipMetadata),
    ).toBe(false);
    expect(getVideoClipCanBePosted(baseClip)).toBe(false);
  });
});
