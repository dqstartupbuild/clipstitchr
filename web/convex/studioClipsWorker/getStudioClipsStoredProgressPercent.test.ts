import { describe, expect, it } from "vitest";
import { getStudioClipsStoredProgressPercent } from "./getStudioClipsStoredProgressPercent";

describe("getStudioClipsStoredProgressPercent", () => {
  it("keeps visible progress when a resumed worker announces its new attempt", () => {
    expect(
      getStudioClipsStoredProgressPercent({
        code: "worker_started",
        currentProgressPercent: 70,
        reportedProgressPercent: 1,
      }),
    ).toBe(70);
  });

  it.each(["cancelled", "failed"])(
    "keeps the last completed stage for a %s terminal event",
    (code) => {
      expect(
        getStudioClipsStoredProgressPercent({
          code,
          currentProgressPercent: 70,
          reportedProgressPercent: 0,
        }),
      ).toBe(70);
    },
  );

  it("accepts forward progress and rejects a regressed pipeline stage", () => {
    expect(
      getStudioClipsStoredProgressPercent({
        code: "rendered",
        currentProgressPercent: 70,
        reportedProgressPercent: 85,
      }),
    ).toBe(85);
    expect(() =>
      getStudioClipsStoredProgressPercent({
        code: "source_acquired",
        currentProgressPercent: 70,
        reportedProgressPercent: 20,
      }),
    ).toThrow("cannot move backward");
  });
});
