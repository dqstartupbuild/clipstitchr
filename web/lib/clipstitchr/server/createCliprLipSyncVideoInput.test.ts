import { describe, expect, it } from "vitest";
import { createCliprLipSyncVideoInput } from "@/lib/clipstitchr/server/createCliprLipSyncVideoInput";

describe("createCliprLipSyncVideoInput", () => {
  it("uses video and audio fields for LatentSync and PixVerse", () => {
    expect(
      createCliprLipSyncVideoInput({
        audioUrl: "https://example.com/speech.mp3",
        modelId: "pixverse/lipsync",
        videoUrl: "https://example.com/avatar.mp4",
      }),
    ).toEqual({
      audio: "https://example.com/speech.mp3",
      video: "https://example.com/avatar.mp4",
    });
    expect(
      createCliprLipSyncVideoInput({
        audioUrl: "https://example.com/speech.mp3",
        modelId:
          "bytedance/latentsync:637ce1919f807ca20da3a448ddc2743535d2853649574cd52a933120e9b9e293",
        videoUrl: "https://example.com/avatar.mp4",
      }),
    ).toEqual({
      audio: "https://example.com/speech.mp3",
      guidance_scale: 1,
      seed: 0,
      video: "https://example.com/avatar.mp4",
    });
  });

});
