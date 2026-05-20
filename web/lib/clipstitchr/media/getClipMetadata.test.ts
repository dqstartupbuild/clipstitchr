import { describe, expect, it, vi } from "vitest";
import type { Input } from "mediabunny";
import { getClipMetadata } from "@/lib/clipstitchr/media/getClipMetadata";

function createVideoTrack() {
  return {
    canDecode: vi.fn().mockResolvedValue(true),
    getDisplayHeight: vi.fn().mockResolvedValue(1920),
    getDisplayWidth: vi.fn().mockResolvedValue(1080),
    getRotation: vi.fn().mockResolvedValue(0),
  };
}

function createAudioTrack() {
  return {
    canDecode: vi.fn().mockResolvedValue(false),
  };
}

describe("getClipMetadata", () => {
  it("reads video and audio track metadata", async () => {
    const videoTrack = createVideoTrack();
    const audioTrack = createAudioTrack();
    const input = {
      canRead: vi.fn().mockResolvedValue(true),
      computeDuration: vi.fn().mockResolvedValue(12.5),
      getMimeType: vi.fn().mockResolvedValue("video/mp4"),
      getPrimaryAudioTrack: vi.fn().mockResolvedValue(audioTrack),
      getPrimaryVideoTrack: vi.fn().mockResolvedValue(videoTrack),
    } as unknown as Input;

    await expect(getClipMetadata(input)).resolves.toEqual({
      aspectRatio: 1080 / 1920,
      audioCanDecode: false,
      duration: 12.5,
      hasAudio: true,
      height: 1920,
      mimeType: "video/mp4",
      rotation: 0,
      videoCanDecode: true,
      width: 1080,
    });
    expect(input.computeDuration).toHaveBeenCalledWith([
      videoTrack,
      audioTrack,
    ]);
  });

  it("handles clips without audio tracks", async () => {
    const videoTrack = createVideoTrack();
    const input = {
      canRead: vi.fn().mockResolvedValue(true),
      computeDuration: vi.fn().mockResolvedValue(8),
      getMimeType: vi.fn().mockResolvedValue("video/webm"),
      getPrimaryAudioTrack: vi.fn().mockResolvedValue(null),
      getPrimaryVideoTrack: vi.fn().mockResolvedValue(videoTrack),
    } as unknown as Input;

    const metadata = await getClipMetadata(input);

    expect(metadata.hasAudio).toBe(false);
    expect(metadata.audioCanDecode).toBe(true);
    expect(input.computeDuration).toHaveBeenCalledWith([videoTrack]);
  });

  it("throws when the input cannot be read or has no video track", async () => {
    const unreadableInput = {
      canRead: vi.fn().mockResolvedValue(false),
    } as unknown as Input;

    await expect(getClipMetadata(unreadableInput)).rejects.toThrow(
      "This file could not be read as a supported media file.",
    );

    const audioOnlyInput = {
      canRead: vi.fn().mockResolvedValue(true),
      getPrimaryVideoTrack: vi.fn().mockResolvedValue(null),
    } as unknown as Input;

    await expect(getClipMetadata(audioOnlyInput)).rejects.toThrow(
      "ClipStitchr needs a video track to normalize this upload.",
    );
  });
});
