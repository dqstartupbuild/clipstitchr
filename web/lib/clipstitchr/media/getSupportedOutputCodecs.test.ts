import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSupportedOutputCodecs } from "@/lib/clipstitchr/media/getSupportedOutputCodecs";

const mocks = vi.hoisted(() => ({
  getFirstEncodableAudioCodec: vi.fn(),
  getFirstEncodableVideoCodec: vi.fn(),
  getSupportedAudioCodecs: vi.fn(),
  getSupportedVideoCodecs: vi.fn(),
}));

vi.mock("mediabunny", () => ({
  getFirstEncodableAudioCodec: mocks.getFirstEncodableAudioCodec,
  getFirstEncodableVideoCodec: mocks.getFirstEncodableVideoCodec,
  Mp4OutputFormat: vi.fn(function Mp4OutputFormat() {
    return {
    getSupportedAudioCodecs: mocks.getSupportedAudioCodecs,
    getSupportedVideoCodecs: mocks.getSupportedVideoCodecs,
    };
  }),
}));

describe("getSupportedOutputCodecs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSupportedVideoCodecs.mockReturnValue(["avc", "vp9"]);
    mocks.getSupportedAudioCodecs.mockReturnValue(["aac"]);
    mocks.getFirstEncodableVideoCodec.mockResolvedValue("avc");
    mocks.getFirstEncodableAudioCodec.mockResolvedValue("aac");
  });

  it("returns the first encodable video and audio codecs from supported preferences", async () => {
    await expect(getSupportedOutputCodecs(true)).resolves.toEqual({
      audioCodec: "aac",
      videoCodec: "avc",
      warnings: [],
    });
    expect(mocks.getFirstEncodableVideoCodec).toHaveBeenCalledWith(
      ["avc", "vp9"],
      {
        bitrate: 8_000_000,
        height: 1920,
        width: 1080,
      },
    );
    expect(mocks.getFirstEncodableAudioCodec).toHaveBeenCalledWith(["aac"], {
      bitrate: 160_000,
      numberOfChannels: 2,
      sampleRate: 48000,
    });
  });

  it("skips audio checks when audio is not requested", async () => {
    await expect(getSupportedOutputCodecs(false)).resolves.toEqual({
      audioCodec: null,
      videoCodec: "avc",
      warnings: [],
    });
    expect(mocks.getFirstEncodableAudioCodec).not.toHaveBeenCalled();
  });

  it("adds warnings when required codecs cannot be encoded", async () => {
    mocks.getFirstEncodableVideoCodec.mockResolvedValue(null);
    mocks.getFirstEncodableAudioCodec.mockResolvedValue(null);

    await expect(getSupportedOutputCodecs(true)).resolves.toEqual({
      audioCodec: null,
      videoCodec: null,
      warnings: [
        "This browser cannot create ClipStitchr videos. Try a modern desktop browser.",
        "This browser cannot keep audio in ClipStitchr videos. Try a modern desktop browser.",
      ],
    });
  });
});
