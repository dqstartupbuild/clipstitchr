import { describe, expect, it } from "vitest";
import { createAvatarPhotoGenerationInput } from "@/lib/clipstitchr/server/createAvatarPhotoGenerationInput";

describe("createAvatarPhotoGenerationInput", () => {
  const image = new File(["avatar"], "avatar.jpg", {
    type: "image/jpeg",
  });

  it("creates GPT Image 2 inputs for the default avatar model", () => {
    expect(
      createAvatarPhotoGenerationInput({
        image,
        modelId: "openai/gpt-image-2",
        prompt: "Create an avatar photo.",
        quality: "medium",
      }),
    ).toEqual({
      prompt: "Create an avatar photo.",
      input_images: [image],
      aspect_ratio: "2:3",
      number_of_images: 1,
      output_format: "jpeg",
      quality: "medium",
      background: "opaque",
      moderation: "auto",
    });
  });

  it("creates Pruna z-image-turbo img2img inputs for versioned avatar models", () => {
    expect(
      createAvatarPhotoGenerationInput({
        image,
        modelId:
          "prunaai/z-image-turbo-img2img:5c958e90e0f904240629ee35c69196e3bd790b5528c0696705ebdb1656871dd8",
        prompt: "Transform the avatar photo.",
        quality: "high",
      }),
    ).toEqual({
      prompt: "Transform the avatar photo.",
      image,
      strength: 0.6,
      num_inference_steps: 8,
      guidance_scale: 0,
      output_format: "jpg",
      output_quality: 90,
    });
  });
});
