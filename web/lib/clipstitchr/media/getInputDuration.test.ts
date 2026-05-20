import { describe, expect, it, vi } from "vitest";
import { getInputDuration } from "@/lib/clipstitchr/media/getInputDuration";

describe("getInputDuration", () => {
  it("computes duration from available primary input tracks", async () => {
    const videoTrack = { id: "video" };
    const audioTrack = { id: "audio" };
    const input = {
      computeDuration: vi.fn(async () => 12),
      getPrimaryAudioTrack: vi.fn(async () => audioTrack),
      getPrimaryVideoTrack: vi.fn(async () => videoTrack),
    };

    await expect(getInputDuration(input as never)).resolves.toBe(12);
    expect(input.computeDuration).toHaveBeenCalledWith([videoTrack, audioTrack]);
  });

  it("handles inputs without primary media tracks", async () => {
    const input = {
      computeDuration: vi.fn(async () => 0),
      getPrimaryAudioTrack: vi.fn(async () => null),
      getPrimaryVideoTrack: vi.fn(async () => null),
    };

    await expect(getInputDuration(input as never)).resolves.toBe(0);
    expect(input.computeDuration).toHaveBeenCalledWith([]);
  });
});
