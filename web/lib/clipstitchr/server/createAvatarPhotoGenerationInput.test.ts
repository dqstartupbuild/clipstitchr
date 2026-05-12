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

  it("creates MiniMax Image-01 inputs with a subject reference", () => {
    expect(
      createAvatarPhotoGenerationInput({
        image,
        modelId: "minimax/image-01",
        prompt: "Create an avatar photo.",
        quality: "high",
      }),
    ).toEqual({
      prompt: "Create an avatar photo.",
      aspect_ratio: "3:4",
      number_of_images: 1,
      prompt_optimizer: false,
      subject_reference: image,
    });
  });
});
