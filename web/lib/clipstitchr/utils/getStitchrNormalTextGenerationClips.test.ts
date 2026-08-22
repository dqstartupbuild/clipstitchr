import { describe, expect, it } from "vitest";
import { getStitchrNormalTextGenerationClips } from "@/lib/clipstitchr/utils/getStitchrNormalTextGenerationClips";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

const ugcClip = { id: "ugc_1" } as VideoClipMetadata;
const demoClip = { id: "demo_1" } as VideoClipMetadata;

describe("getStitchrNormalTextGenerationClips", () => {
  it("keeps both sources for a paired Normal output", () => {
    expect(getStitchrNormalTextGenerationClips(ugcClip, demoClip)).toEqual([
      ugcClip,
      demoClip,
    ]);
  });

  it("includes a demo once for a Demo-only output", () => {
    expect(getStitchrNormalTextGenerationClips(null, demoClip)).toEqual([
      demoClip,
    ]);
  });
});
