import { describe, expect, it } from "vitest";
import { createCliprAvatarVideoInput } from "@/lib/clipstitchr/server/createCliprAvatarVideoInput";

describe("createCliprAvatarVideoInput", () => {
  it("creates the Pruna avatar video input with generated speech audio", () => {
    const input = createCliprAvatarVideoInput({
      audioUrl: "https://example.com/speech.mp3",
      imageUrl: "https://example.com/avatar.jpg",
      script: "This is the full Clipr script.",
      voiceId: "Drew",
    });

    expect(input).toMatchObject({
      audio: "https://example.com/speech.mp3",
      image: "https://example.com/avatar.jpg",
      resolution: "720p",
      disable_prompt_upsampling: true,
    });
    expect(input).not.toHaveProperty("voice");
    expect(input).not.toHaveProperty("voice_language");
    expect(input).not.toHaveProperty("voice_prompt");
    expect(input).not.toHaveProperty("voice_script");
  });

  it("keeps the video prompt limited to animating the provided photo", () => {
    const input = createCliprAvatarVideoInput({
      imageUrl: "https://example.com/avatar.jpg",
      script: "This is the full Clipr script.",
      voiceId: "Drew",
    });

    expect(input.video_prompt).toContain(
      "one continuous, realistic talking-head video",
    );
    expect(input.video_prompt).toContain("complete visual reference");
    expect(input.video_prompt).not.toContain("Visual direction");
  });

  it("falls back to a bundled Pruna voice when no generated audio is used", () => {
    expect(
      createCliprAvatarVideoInput({
        imageUrl: "https://example.com/avatar.jpg",
        script: "Script",
        voiceId: "unknown",
      }),
    ).toHaveProperty("voice", "Zephyr (Female)");
  });
});
