import { describe, expect, it } from "vitest";
import { createCliprGeneratedVideoInput } from "@/lib/clipstitchr/server/createCliprGeneratedVideoInput";

describe("createCliprGeneratedVideoInput", () => {
  it("creates a vertical p-video input without a reference image", () => {
    expect(
      createCliprGeneratedVideoInput({
        durationSeconds: 12.2,
        prompt: "Generate a realistic scene.",
      }),
    ).toEqual({
      aspect_ratio: "9:16",
      prompt: "Generate a realistic scene.",
      duration: 13,
      resolution: "720p",
      fps: 24,
      draft: false,
      prompt_upsampling: false,
      disable_safety_filter: true,
      save_audio: false,
    });
  });

  it("uses a reference image and caps provider scene duration at twenty seconds", () => {
    expect(
      createCliprGeneratedVideoInput({
        durationSeconds: 60,
        imageUrl: "https://example.com/avatar.jpg",
        prompt: "Generate avatar b-roll.",
      }),
    ).toEqual(
      expect.objectContaining({
        image: "https://example.com/avatar.jpg",
        duration: 20,
      }),
    );
  });
});
