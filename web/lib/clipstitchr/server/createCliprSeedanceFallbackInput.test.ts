import { describe, expect, it } from "vitest";
import { createCliprSeedanceFallbackInput } from "@/lib/clipstitchr/server/createCliprSeedanceFallbackInput";

describe("createCliprSeedanceFallbackInput", () => {
  it("removes audio references while keeping image references and dialogue", () => {
    const input = createCliprSeedanceFallbackInput({
      prompt: [
        "Create a vertical short-form social video.",
        "Use [Audio1] only as the spoken voice and timing reference for the creator's dialogue.",
        'Spoken dialogue: "Keep the rep slow and controlled."',
      ].join("\n"),
      reference_audios: ["https://replicate.delivery/audio.mp3"],
      reference_images: ["https://api.replicate.com/v1/files/avatar.png"],
      aspect_ratio: "9:16",
    });

    expect(input).toEqual({
      prompt: [
        "Create a vertical short-form social video.",
        'The creator says: "Keep the rep slow and controlled."',
      ].join("\n"),
      reference_images: ["https://api.replicate.com/v1/files/avatar.png"],
      aspect_ratio: "9:16",
    });
  });

  it("does not create a fallback when no audio reference was used", () => {
    expect(
      createCliprSeedanceFallbackInput({
        prompt: "Create a vertical short-form social video.",
        reference_images: ["https://api.replicate.com/v1/files/avatar.png"],
      }),
    ).toBeNull();
  });
});
