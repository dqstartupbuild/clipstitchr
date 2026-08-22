import { describe, expect, it } from "vitest";
import { getStitchSegmentAudioLabel } from "@/lib/clipstitchr/utils/getStitchSegmentAudioLabel";

describe("getStitchSegmentAudioLabel", () => {
  it("uses the matching source audio setting", () => {
    const stitch = {
      includeDemoAudio: true,
      includeUgcAudio: false,
    } as never;

    expect(getStitchSegmentAudioLabel("ugc", stitch)).toBe("Muted");
    expect(getStitchSegmentAudioLabel("demo", stitch)).toBe("Included");
  });
});
