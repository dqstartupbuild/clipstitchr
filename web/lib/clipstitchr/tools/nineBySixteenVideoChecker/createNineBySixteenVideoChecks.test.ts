import { describe, expect, it } from "vitest";
import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";
import { scoreVideoChecks } from "@/lib/clipstitchr/tools/localVideoInspection/scoreVideoChecks";
import { createNineBySixteenVideoChecks } from "@/lib/clipstitchr/tools/nineBySixteenVideoChecker/createNineBySixteenVideoChecks";
import { getNineBySixteenVideoStatus } from "@/lib/clipstitchr/tools/nineBySixteenVideoChecker/getNineBySixteenVideoStatus";

function createInspection(
  overrides: Partial<LocalVideoInspection> = {},
): LocalVideoInspection {
  return {
    aspectRatio: 9 / 16,
    audioBitrate: 160_000,
    audioCanDecode: true,
    audioChannels: 2,
    audioCodec: "aac",
    audioCodecParameter: "mp4a.40.2",
    audioSampleRate: 48_000,
    audioTrackCount: 1,
    duration: 18,
    fileName: "demo.mp4",
    fileSize: 12_000_000,
    hasAudio: true,
    hasHighDynamicRange: false,
    height: 1920,
    mimeType: 'video/mp4; codecs="avc1.640028, mp4a.40.2"',
    pixelAspectRatio: { den: 1, num: 1 },
    rotation: 0,
    videoBitrate: 8_000_000,
    videoCanDecode: true,
    videoCodec: "avc",
    videoCodecParameter: "avc1.640028",
    videoFrameRate: 30,
    videoTrackCount: 1,
    width: 1080,
    ...overrides,
  };
}

describe("createNineBySixteenVideoChecks", () => {
  it("marks a 1080x1920 AVC/AAC SDR file ready", () => {
    const checks = createNineBySixteenVideoChecks(createInspection());
    const score = scoreVideoChecks(checks);

    expect(checks).toHaveLength(7);
    expect(checks.every((check) => check.status === "pass")).toBe(true);
    expect(score).toEqual({ hasCriticalFailure: false, percentage: 100 });
    expect(getNineBySixteenVideoStatus(score)).toBe("Ready");
  });

  it("warns for a workable 720x1280 file without making it a critical failure", () => {
    const checks = createNineBySixteenVideoChecks(
      createInspection({ height: 1280, width: 720 }),
    );
    const resolution = checks.find((check) => check.id === "resolution");
    const score = scoreVideoChecks(checks);

    expect(resolution?.status).toBe("warning");
    expect(score).toEqual({ hasCriticalFailure: false, percentage: 90 });
    expect(getNineBySixteenVideoStatus(score)).toBe("Ready");
  });

  it("fails a landscape shape even when its codec and resolution are strong", () => {
    const checks = createNineBySixteenVideoChecks(
      createInspection({ aspectRatio: 16 / 9, height: 1080, width: 1920 }),
    );
    const score = scoreVideoChecks(checks);

    expect(checks.find((check) => check.id === "aspect-ratio")?.status).toBe(
      "fail",
    );
    expect(score.hasCriticalFailure).toBe(true);
    expect(getNineBySixteenVideoStatus(score)).toBe("Needs changes");
  });

  it("keeps silent video valid and warns for unknown or less portable facts", () => {
    const checks = createNineBySixteenVideoChecks(
      createInspection({
        audioCodec: null,
        audioCodecParameter: null,
        audioTrackCount: 0,
        hasAudio: false,
        hasHighDynamicRange: true,
        mimeType: 'video/webm; codecs="vp9"',
        pixelAspectRatio: null,
        videoCodec: "vp9",
        videoCodecParameter: "vp09.00.10.08",
        videoFrameRate: null,
      }),
    );

    expect(checks.find((check) => check.id === "audio")?.status).toBe("pass");
    expect(checks.find((check) => check.id === "format")?.status).toBe(
      "warning",
    );
    expect(checks.find((check) => check.id === "frame-rate")?.status).toBe(
      "warning",
    );
    expect(
      checks.find((check) => check.id === "color-and-pixels")?.status,
    ).toBe("warning");
  });

  it("treats an undecodable video track as a critical failure", () => {
    const checks = createNineBySixteenVideoChecks(
      createInspection({ videoCanDecode: false }),
    );
    const score = scoreVideoChecks(checks);

    expect(checks.find((check) => check.id === "video-decode")?.status).toBe(
      "fail",
    );
    expect(score.hasCriticalFailure).toBe(true);
    expect(getNineBySixteenVideoStatus(score)).toBe("Needs changes");
  });
});
