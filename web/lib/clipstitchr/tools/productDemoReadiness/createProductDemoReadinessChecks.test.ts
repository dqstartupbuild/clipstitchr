import { describe, expect, it } from "vitest";
import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";
import { scoreVideoChecks } from "@/lib/clipstitchr/tools/localVideoInspection/scoreVideoChecks";
import type { ProductDemoAnswers } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoAnswers";
import { createProductDemoReadinessChecks } from "@/lib/clipstitchr/tools/productDemoReadiness/createProductDemoReadinessChecks";
import { defaultProductDemoAnswers } from "@/lib/clipstitchr/tools/productDemoReadiness/defaultProductDemoAnswers";
import { getProductDemoReadinessFixes } from "@/lib/clipstitchr/tools/productDemoReadiness/getProductDemoReadinessFixes";
import { getProductDemoReadinessStatus } from "@/lib/clipstitchr/tools/productDemoReadiness/getProductDemoReadinessStatus";

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
    mimeType: "video/mp4",
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

function createYesAnswers(): ProductDemoAnswers {
  return {
    "action-and-result": "yes",
    "clear-next-step": "yes",
    "dead-time-removed": "yes",
    "one-outcome": "yes",
    "phone-readable": "yes",
    "private-data-hidden": "yes",
    "spoken-words-captioned": "yes",
    "useful-moment": "yes",
  };
}

describe("createProductDemoReadinessChecks", () => {
  it("marks a playable focused demo with eight yes answers ready to test", () => {
    const checks = createProductDemoReadinessChecks({
      answers: createYesAnswers(),
      inspection: createInspection(),
      use: "short-form-ad",
    });
    const score = scoreVideoChecks(checks);

    expect(checks).toHaveLength(12);
    expect(score).toEqual({ hasCriticalFailure: false, percentage: 100 });
    expect(getProductDemoReadinessStatus(score)).toBe("Ready to test");
  });

  it("excludes a not-applicable caption answer from the denominator", () => {
    const answers = createYesAnswers();
    answers["spoken-words-captioned"] = "not-applicable";
    const checks = createProductDemoReadinessChecks({
      answers,
      inspection: createInspection({ hasAudio: false }),
      use: "short-form-ad",
    });
    const captionCheck = checks.find(
      (check) => check.id === "spoken-words-captioned",
    );

    expect(captionCheck).toMatchObject({ status: "pass", weight: 0 });
    expect(scoreVideoChecks(checks).percentage).toBe(100);
  });

  it("keeps private-data and unreadable-interface failures as blockers", () => {
    const answers = createYesAnswers();
    answers["private-data-hidden"] = "no";
    const checks = createProductDemoReadinessChecks({
      answers,
      inspection: createInspection(),
      use: "short-form-ad",
    });
    const score = scoreVideoChecks(checks);

    expect(score.percentage).toBeGreaterThan(80);
    expect(score.hasCriticalFailure).toBe(true);
    expect(getProductDemoReadinessStatus(score)).toBe("Needs another pass");
    expect(getProductDemoReadinessFixes(checks)[0]?.id).toBe(
      "private-data-hidden",
    );
  });

  it("labels default not-sure answers as warnings and uses planning ranges as guidance", () => {
    const checks = createProductDemoReadinessChecks({
      answers: defaultProductDemoAnswers,
      inspection: createInspection({ duration: 75 }),
      use: "organic-post",
    });

    expect(checks.find((check) => check.id === "planning-length")).toMatchObject(
      {
        status: "warning",
        target: expect.stringContaining("planning guideline"),
      },
    );
    expect(checks.find((check) => check.id === "one-outcome")?.status).toBe(
      "warning",
    );
  });

  it("treats an undecodable primary video as a blocker", () => {
    const checks = createProductDemoReadinessChecks({
      answers: createYesAnswers(),
      inspection: createInspection({ videoCanDecode: false }),
      use: "landing-page",
    });
    const score = scoreVideoChecks(checks);

    expect(checks.find((check) => check.id === "video-playback")?.status).toBe(
      "fail",
    );
    expect(score.hasCriticalFailure).toBe(true);
    expect(getProductDemoReadinessStatus(score)).toBe("Needs another pass");
  });
});
