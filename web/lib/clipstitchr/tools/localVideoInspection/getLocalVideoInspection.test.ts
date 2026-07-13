import { describe, expect, it, vi } from "vitest";
import type { Input } from "mediabunny";
import { getLocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/getLocalVideoInspection";

const mocks = vi.hoisted(() => ({
  getClipMetadata: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/media/getClipMetadata", () => ({
  getClipMetadata: mocks.getClipMetadata,
}));

function createMetadata() {
  return {
    aspectRatio: 9 / 16,
    audioCanDecode: true,
    duration: 18,
    hasAudio: true,
    height: 1920,
    mimeType: 'video/mp4; codecs="avc1.640028, mp4a.40.2"',
    rotation: 0,
    videoCanDecode: true,
    width: 1080,
  };
}

describe("getLocalVideoInspection", () => {
  it("adds detailed local track facts to the reusable clip metadata", async () => {
    mocks.getClipMetadata.mockResolvedValue(createMetadata());
    const videoTrack = {
      computePacketStats: vi.fn().mockResolvedValue({
        averageBitrate: 8_000_000,
        averagePacketRate: 30,
      }),
      getCodec: vi.fn().mockResolvedValue("avc"),
      getCodecParameterString: vi.fn().mockResolvedValue("avc1.640028"),
      getPixelAspectRatio: vi.fn().mockResolvedValue({ den: 1, num: 1 }),
      hasHighDynamicRange: vi.fn().mockResolvedValue(false),
    };
    const audioTrack = {
      computePacketStats: vi.fn().mockResolvedValue({
        averageBitrate: 160_000,
        averagePacketRate: 47,
      }),
      getCodec: vi.fn().mockResolvedValue("aac"),
      getCodecParameterString: vi.fn().mockResolvedValue("mp4a.40.2"),
      getNumberOfChannels: vi.fn().mockResolvedValue(2),
      getSampleRate: vi.fn().mockResolvedValue(48_000),
    };
    const input = {
      getAudioTracks: vi.fn().mockResolvedValue([audioTrack]),
      getPrimaryAudioTrack: vi.fn().mockResolvedValue(audioTrack),
      getPrimaryVideoTrack: vi.fn().mockResolvedValue(videoTrack),
      getVideoTracks: vi.fn().mockResolvedValue([videoTrack, {}]),
    } as unknown as Input;
    const file = new File(["video"], "demo.mp4", { type: "video/mp4" });

    await expect(getLocalVideoInspection(input, file)).resolves.toEqual(
      expect.objectContaining({
        audioBitrate: 160_000,
        audioChannels: 2,
        audioCodec: "aac",
        audioSampleRate: 48_000,
        audioTrackCount: 1,
        fileName: "demo.mp4",
        fileSize: 5,
        hasHighDynamicRange: false,
        pixelAspectRatio: { den: 1, num: 1 },
        videoBitrate: 8_000_000,
        videoCodec: "avc",
        videoFrameRate: 30,
        videoTrackCount: 2,
      }),
    );
    expect(videoTrack.computePacketStats).toHaveBeenCalledWith(120);
  });

  it("keeps a valid silent report when optional facts cannot be estimated", async () => {
    mocks.getClipMetadata.mockResolvedValue({
      ...createMetadata(),
      audioCanDecode: true,
      hasAudio: false,
    });
    const videoTrack = {
      computePacketStats: vi.fn().mockRejectedValue(new Error("No stats")),
      getCodec: vi.fn().mockRejectedValue(new Error("No codec")),
      getCodecParameterString: vi.fn().mockRejectedValue(new Error("No codec")),
      getPixelAspectRatio: vi.fn().mockRejectedValue(new Error("No ratio")),
      hasHighDynamicRange: vi.fn().mockRejectedValue(new Error("No HDR fact")),
    };
    const input = {
      getAudioTracks: vi.fn().mockRejectedValue(new Error("No list")),
      getPrimaryAudioTrack: vi.fn().mockResolvedValue(null),
      getPrimaryVideoTrack: vi.fn().mockResolvedValue(videoTrack),
      getVideoTracks: vi.fn().mockRejectedValue(new Error("No list")),
    } as unknown as Input;

    await expect(
      getLocalVideoInspection(
        input,
        new File(["video"], "silent.mov", { type: "video/quicktime" }),
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        audioCodec: null,
        audioTrackCount: 0,
        hasHighDynamicRange: null,
        pixelAspectRatio: null,
        videoCodec: null,
        videoFrameRate: null,
        videoTrackCount: 1,
      }),
    );
  });

  it("rejects a file without a video track", async () => {
    mocks.getClipMetadata.mockResolvedValue(createMetadata());
    const input = {
      getPrimaryVideoTrack: vi.fn().mockResolvedValue(null),
    } as unknown as Input;

    await expect(
      getLocalVideoInspection(input, new File(["audio"], "audio.m4a")),
    ).rejects.toThrow("contains a video track");
  });
});
