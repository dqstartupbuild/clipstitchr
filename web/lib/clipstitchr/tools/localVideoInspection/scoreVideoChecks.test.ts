import { describe, expect, it } from "vitest";
import { scoreVideoChecks } from "@/lib/clipstitchr/tools/localVideoInspection/scoreVideoChecks";
import type { VideoCheck } from "@/lib/clipstitchr/tools/localVideoInspection/VideoCheck";

describe("scoreVideoChecks", () => {
  it("awards full, half, and zero weight while preserving critical failures", () => {
    const checks: VideoCheck[] = [
      {
        fix: null,
        id: "pass",
        isCritical: false,
        observed: "Good",
        status: "pass",
        target: "Good",
        title: "Pass",
        weight: 50,
      },
      {
        fix: "Review it",
        id: "warning",
        isCritical: false,
        observed: "Close",
        status: "warning",
        target: "Good",
        title: "Warning",
        weight: 20,
      },
      {
        fix: "Fix it",
        id: "fail",
        isCritical: true,
        observed: "Bad",
        status: "fail",
        target: "Good",
        title: "Fail",
        weight: 30,
      },
    ];

    expect(scoreVideoChecks(checks)).toEqual({
      hasCriticalFailure: true,
      percentage: 60,
    });
  });

  it("returns a safe zero for an empty or zero-weight checklist", () => {
    expect(scoreVideoChecks([])).toEqual({
      hasCriticalFailure: false,
      percentage: 0,
    });
  });
});
