import { describe, expect, it } from "vitest";
import { getStudioEditorAudioGain } from "./getStudioEditorAudioGain";
import { createStudioEditorTestFixture } from "@/lib/clipstitchr/studio/editor/test/createStudioEditorTestFixture";

describe("getStudioEditorAudioGain", () => {
  it("applies volume and both edge fades without exceeding the layer gain", () => {
    const { video } = createStudioEditorTestFixture();

    expect(getStudioEditorAudioGain(video, 0)).toBe(0);
    expect(getStudioEditorAudioGain(video, 0.25)).toBeCloseTo(0.5);
    expect(getStudioEditorAudioGain(video, 2)).toBe(1);
    expect(getStudioEditorAudioGain(video, 3.75)).toBeCloseTo(0.5);
    expect(getStudioEditorAudioGain(video, 4)).toBe(0);
  });

  it("stays silent when the layer is muted", () => {
    const { video } = createStudioEditorTestFixture();

    expect(
      getStudioEditorAudioGain(
        { ...video, audio: { ...video.audio, muted: true } },
        2,
      ),
    ).toBe(0);
  });
});
