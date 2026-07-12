import { describe, expect, it } from "vitest";
import { parseHookLabVariantFinalizationInput } from "./parseHookLabVariantFinalizationInput.mjs";

describe("parseHookLabVariantFinalizationInput", () => {
  it("bounds trim ranges and keeps version lineage", () => {
    const input = parseHookLabVariantFinalizationInput(
      JSON.stringify({
        clipId: "clip-1",
        clipName: "Opening",
        demoClipId: "demo-1",
        demoClipName: "Demo",
        demoDuration: 6,
        demoTrimRange: { start: -2, end: 20 },
        hookLabIdeaId: "idea-1",
        hookLabIdeaUseId: "use-1",
        hookLabIdeaVariantId: "variant-1",
        hookLabIdeaVariantIndex: 2,
        productId: "product-1",
        providerJobId: "provider-1",
        sourceVideoObject: {
          contentType: "video/mp4",
          key: "users/user-1/source.mp4",
          size: 100,
        },
        stitchId: "stitch-1",
        stitchName: "Finished Stitch",
        ugcDuration: 8,
      }),
    );

    expect(input.demoTrimRange).toEqual({ start: 0, end: 6 });
    expect(input.hookLabIdeaVariantIndex).toBe(2);
    expect(input.includeDemoAudio).toBe(true);
  });
});
