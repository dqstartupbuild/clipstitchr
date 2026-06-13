import { describe, expect, it } from "vitest";
import { createCliprVisualVideoInput } from "@/lib/clipstitchr/server/createCliprVisualVideoInput";

describe("createCliprVisualVideoInput", () => {
  it("uses Seedance reference images instead of a first-frame image", () => {
    expect(
      createCliprVisualVideoInput({
        durationSeconds: 8,
        imageUrl: "https://example.com/avatar.jpg",
        modelId: "bytedance/seedance-2.0",
        prompt: "Create one silent reaction shot.",
      }),
    ).toEqual({
      prompt: [
        "Use the avatar in [Image1] as the visual identity reference.",
        "Create a new continuous shot from the instructions below.",
        "Create one silent reaction shot.",
      ].join("\n\n"),
      reference_images: ["https://example.com/avatar.jpg"],
      duration: 8,
      resolution: "720p",
      aspect_ratio: "9:16",
      generate_audio: false,
    });
  });
});
