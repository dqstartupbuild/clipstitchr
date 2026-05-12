import { describe, expect, it } from "vitest";
import { createCliprAvatarVideoInput } from "@/lib/clipstitchr/server/createCliprAvatarVideoInput";

describe("createCliprAvatarVideoInput", () => {
  it("creates the Pruna avatar video input with selected voice settings", () => {
    expect(
      createCliprAvatarVideoInput({
        imageUrl: "https://example.com/avatar.jpg",
        script: "This is the full Clipr script.",
        voiceId: "Puck (Male)",
      }),
    ).toMatchObject({
      image: "https://example.com/avatar.jpg",
      voice_script: "This is the full Clipr script.",
      voice: "Puck (Male)",
      voice_language: "English (US)",
      resolution: "720p",
      disable_prompt_upsampling: true,
    });
  });

  it("keeps the video prompt limited to animating the provided photo", () => {
    const input = createCliprAvatarVideoInput({
      imageUrl: "https://example.com/avatar.jpg",
      script: "This is the full Clipr script.",
      voiceId: "Puck (Male)",
    });

    expect(input.video_prompt).toContain("one continuous, realistic talking-head video");
    expect(input.video_prompt).toContain("complete visual reference");
    expect(input.video_prompt).not.toContain("Visual direction");
  });

  it("falls back to the default Pruna voice", () => {
    expect(
      createCliprAvatarVideoInput({
        imageUrl: "https://example.com/avatar.jpg",
        script: "Script",
        voiceId: "unknown",
      }).voice,
    ).toBe("Zephyr (Female)");
  });
});
