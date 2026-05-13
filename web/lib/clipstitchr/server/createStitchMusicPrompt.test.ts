import { describe, expect, it } from "vitest";
import { createStitchMusicPrompt } from "@/lib/clipstitchr/server/createStitchMusicPrompt";

describe("createStitchMusicPrompt", () => {
  it("keeps stitch music instrumental and source-aware", () => {
    const prompt = createStitchMusicPrompt({
      demoClipName: "Product walkthrough",
      ugcClipName: "Creator opener",
      textOverlay: {
        text: "Stop losing hours to editing",
        startTime: 0,
        endTime: 3,
        x: 0.5,
        y: 0.5,
        width: 0.8,
        fontSize: 0.08,
        styleId: "hook",
      },
    });

    expect(prompt).toContain("Instrumental-only");
    expect(prompt).toContain("No vocals");
    expect(prompt).toContain("Creator opener into Product walkthrough");
    expect(prompt).toContain("Stop losing hours to editing");
  });
});
