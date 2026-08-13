import { describe, expect, it } from "vitest";
import { assertStudioClipsMediaProbe } from "./assertStudioClipsMediaProbe";

const validProbe = {
  audioCodec: "aac",
  container: "mp4",
  contentType: "video/mp4",
  durationSeconds: 90,
  hasAudio: true,
  hasVideo: true,
  height: 1080,
  sizeBytes: 1_000,
  videoCodec: "h264",
  width: 1920,
};

describe("assertStudioClipsMediaProbe", () => {
  it("accepts bounded video metadata", () => {
    expect(() => assertStudioClipsMediaProbe(validProbe)).not.toThrow();
  });

  it("accepts an accurately silent render only in output mode", () => {
    const silentProbe = {
      ...validProbe,
      audioCodec: undefined,
      hasAudio: false,
    };

    expect(() =>
      assertStudioClipsMediaProbe(silentProbe, { requireAudio: false }),
    ).not.toThrow();
    expect(() => assertStudioClipsMediaProbe(silentProbe)).toThrow(
      "supported video",
    );
    expect(() =>
      assertStudioClipsMediaProbe(
        { ...silentProbe, audioCodec: "aac" },
        { requireAudio: false },
      ),
    ).toThrow("supported video");
  });

  it("rejects oversized, overlong, trackless, and unknown media", () => {
    expect(() =>
      assertStudioClipsMediaProbe({
        ...validProbe,
        durationSeconds: 5_401,
      }),
    ).toThrow("duration");
    expect(() =>
      assertStudioClipsMediaProbe({ ...validProbe, sizeBytes: 1_073_741_825 }),
    ).toThrow("size");
    expect(() =>
      assertStudioClipsMediaProbe({ ...validProbe, hasVideo: false }),
    ).toThrow("supported video");
    expect(() =>
      assertStudioClipsMediaProbe({ ...validProbe, hasAudio: false }),
    ).toThrow("supported video");
    expect(() =>
      assertStudioClipsMediaProbe({ ...validProbe, contentType: "text/html" }),
    ).toThrow("supported video");
  });
});
