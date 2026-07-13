import { describe, expect, it } from "vitest";
import { createAppUgcClipAutomaticChecks } from "@/lib/clipstitchr/tools/appUgcClipReadiness/createAppUgcClipAutomaticChecks";
import { createAppUgcClipReadinessChecks } from "@/lib/clipstitchr/tools/appUgcClipReadiness/createAppUgcClipReadinessChecks";
import { createAppUgcClipReviewChecks } from "@/lib/clipstitchr/tools/appUgcClipReadiness/createAppUgcClipReviewChecks";
import { defaultAppUgcClipAnswers } from "@/lib/clipstitchr/tools/appUgcClipReadiness/defaultAppUgcClipAnswers";
import { formatAppUgcClipReadinessReport } from "@/lib/clipstitchr/tools/appUgcClipReadiness/formatAppUgcClipReadinessReport";
import { getAppUgcClipReadinessFixes } from "@/lib/clipstitchr/tools/appUgcClipReadiness/getAppUgcClipReadinessFixes";
import { getAppUgcClipReadinessStatus } from "@/lib/clipstitchr/tools/appUgcClipReadiness/getAppUgcClipReadinessStatus";
import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";
import { scoreVideoChecks } from "@/lib/clipstitchr/tools/localVideoInspection/scoreVideoChecks";

const inspection: LocalVideoInspection = {
  fileName: "clip.mp4",
  fileSize: 1000,
  duration: 5,
  width: 1080,
  height: 1920,
  aspectRatio: 9 / 16,
  rotation: 0,
  mimeType: "video/mp4",
  hasAudio: true,
  videoCanDecode: true,
  audioCanDecode: true,
  videoCodec: "avc",
  videoCodecParameter: "avc1",
  videoFrameRate: 30,
  videoBitrate: 2_000_000,
  hasHighDynamicRange: false,
  pixelAspectRatio: { num: 1, den: 1 },
  audioCodec: "aac",
  audioCodecParameter: "mp4a",
  audioBitrate: 128_000,
  audioChannels: 2,
  audioSampleRate: 48_000,
  videoTrackCount: 1,
  audioTrackCount: 1,
};

describe("app UGC clip readiness", () => {
  it("blocks a spoken role with no audio", () => {
    const checks = createAppUgcClipAutomaticChecks(
      { ...inspection, hasAudio: false },
      "spoken-hook",
    );
    expect(checks.find((check) => check.id === "role-audio")).toMatchObject({
      status: "fail",
      isCritical: true,
    });
  });

  it("accepts no audio and ignores spoken clarity for a silent role", () => {
    const automatic = createAppUgcClipAutomaticChecks(
      { ...inspection, hasAudio: false },
      "silent-reaction",
    );
    const review = createAppUgcClipReviewChecks(
      defaultAppUgcClipAnswers,
      "silent-reaction",
    );
    expect(automatic.find((check) => check.id === "role-audio")?.status).toBe(
      "pass",
    );
    expect(review.find((check) => check.id === "spoken-clarity")).toMatchObject(
      { status: "pass", weight: 0 },
    );
  });

  it("warns rather than blocks a non-vertical source", () => {
    const check = createAppUgcClipAutomaticChecks(
      { ...inspection, width: 1920, height: 1080, aspectRatio: 16 / 9 },
      "spoken-hook",
    ).find((item) => item.id === "vertical-shape");
    expect(check).toMatchObject({ status: "warning", isCritical: false });
  });

  it("applies role-specific duration boundaries", () => {
    const atBoundary = createAppUgcClipAutomaticChecks(
      { ...inspection, duration: 10 },
      "spoken-hook",
    );
    const overBoundary = createAppUgcClipAutomaticChecks(
      { ...inspection, duration: 10.1 },
      "spoken-hook",
    );

    expect(
      atBoundary.find((check) => check.id === "role-duration")?.status,
    ).toBe("pass");
    expect(
      overBoundary.find((check) => check.id === "role-duration")?.status,
    ).toBe("warning");
  });

  it("makes framing and usage failures blockers", () => {
    const answers = {
      ...defaultAppUgcClipAnswers,
      "center-safe-framing": "no" as const,
      "usage-approved": "no" as const,
    };
    const score = scoreVideoChecks(
      createAppUgcClipReadinessChecks({
        answers,
        inspection,
        role: "spoken-hook",
      }),
    );
    expect(score.hasCriticalFailure).toBe(true);
    expect(getAppUgcClipReadinessStatus(score)).toBe("Not ready to hand off");
  });

  it("marks a fully confirmed playable clip ready", () => {
    const answers = Object.fromEntries(
      Object.keys(defaultAppUgcClipAnswers).map((key) => [key, "yes"]),
    ) as typeof defaultAppUgcClipAnswers;
    const score = scoreVideoChecks(
      createAppUgcClipReadinessChecks({
        answers,
        inspection,
        role: "spoken-hook",
      }),
    );
    expect(score.percentage).toBe(100);
    expect(getAppUgcClipReadinessStatus(score)).toBe("Ready to reuse");
  });

  it("prioritizes critical fixes and formats an honest report", () => {
    const checks = createAppUgcClipReadinessChecks({
      answers: { ...defaultAppUgcClipAnswers, "usage-approved": "no" },
      inspection,
      role: "spoken-hook",
    });
    const score = scoreVideoChecks(checks);
    const status = getAppUgcClipReadinessStatus(score);
    const report = formatAppUgcClipReadinessReport({
      checks,
      percentage: score.percentage,
      role: "spoken-hook",
      status,
    });

    expect(getAppUgcClipReadinessFixes(checks)[0]?.id).toBe("usage-approved");
    expect(report).toContain("Automatic facts cover playback");
    expect(report).toContain("usage approval are your self-review");
    expect(report).not.toContain("undefined");
  });
});
