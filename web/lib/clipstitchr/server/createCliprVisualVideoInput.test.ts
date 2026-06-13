import { describe, expect, it } from "vitest";
import { createCliprVisualVideoInput } from "@/lib/clipstitchr/server/createCliprVisualVideoInput";

describe("createCliprVisualVideoInput", () => {
  it("uses Kling start images for visual Clipr modes", () => {
    expect(
      createCliprVisualVideoInput({
        durationSeconds: 8,
        imageUrl: "https://example.com/avatar.jpg",
        modelId: "kwaivgi/kling-v3-video",
        prompt: "Create one silent reaction shot.",
      }),
    ).toEqual({
      prompt: "Create one silent reaction shot.",
      negative_prompt:
        "speech, talking, lip sync, subtitles, captions, text, watermark, logo, blurry, low quality, extra people, scene cut, montage",
      start_image: "https://example.com/avatar.jpg",
      aspect_ratio: "9:16",
      mode: "pro",
      duration: 8,
      generate_audio: false,
    });
  });

  it("rejects removed visual video models", () => {
    expect(() =>
      createCliprVisualVideoInput({
        durationSeconds: 8,
        imageUrl: "https://example.com/avatar.jpg",
        modelId: "bytedance/seedance-2.0",
        prompt: "Create one silent reaction shot.",
      }),
    ).toThrow("Unsupported Clipr visual video model.");
  });
});
