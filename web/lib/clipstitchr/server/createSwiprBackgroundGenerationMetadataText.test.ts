import { describe, expect, it } from "vitest";
import { createSwiprBackgroundGenerationMetadataText } from "@/lib/clipstitchr/server/createSwiprBackgroundGenerationMetadataText";

describe("createSwiprBackgroundGenerationMetadataText", () => {
  it("serializes variation details for hidden background metadata", () => {
    expect(
      createSwiprBackgroundGenerationMetadataText({
        cameraAngle: "low angle",
        category: "fitness",
        composition: "open center",
        lighting: "morning daylight",
        palette: "charcoal and blue",
        presetId: "outdoor",
        scene: "empty training park",
        surface: "smooth concrete",
      }),
    ).toBe(
      "Category: fitness; Preset: outdoor; Scene: empty training park; Lighting: morning daylight; Camera angle: low angle; Surface: smooth concrete; Palette: charcoal and blue; Composition: open center",
    );
  });
});
