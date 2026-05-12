import { describe, expect, it } from "vitest";
import { createSwiprBackgroundGenerationInput } from "@/lib/clipstitchr/server/createSwiprBackgroundGenerationInput";

describe("createSwiprBackgroundGenerationInput", () => {
  it("creates GPT Image 2 inputs for the default Swipr background model", () => {
    expect(
      createSwiprBackgroundGenerationInput({
        modelId: "openai/gpt-image-2",
        prompt: "Create a background.",
      }),
    ).toEqual({
      prompt: "Create a background.",
      aspect_ratio: "2:3",
      number_of_images: 1,
      output_format: "jpeg",
      quality: "low",
      background: "opaque",
      moderation: "auto",
    });
  });

  it("creates P-Image inputs for fast Swipr background generation", () => {
    expect(
      createSwiprBackgroundGenerationInput({
        modelId: "prunaai/p-image",
        prompt: "Create a background.",
      }),
    ).toEqual({
      prompt: "Create a background.",
      aspect_ratio: "9:16",
      prompt_upsampling: false,
    });
  });

  it("creates Wan 2.2 Image inputs for cinematic Swipr background generation", () => {
    expect(
      createSwiprBackgroundGenerationInput({
        modelId: "prunaai/wan-2.2-image",
        prompt: "Create a background.",
      }),
    ).toEqual({
      prompt: "Create a background.",
      juiced: false,
      megapixels: 2,
      aspect_ratio: "9:16",
      output_format: "jpg",
      output_quality: 80,
    });
  });
});
