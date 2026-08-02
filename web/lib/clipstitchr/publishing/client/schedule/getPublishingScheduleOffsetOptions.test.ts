import { describe, expect, it } from "vitest";
import { getPublishingScheduleOffsetOptions } from "@/lib/clipstitchr/publishing/client/schedule/getPublishingScheduleOffsetOptions";

describe("getPublishingScheduleOffsetOptions", () => {
  it("returns the exact offset for an ordinary local time", () => {
    expect(
      getPublishingScheduleOffsetOptions(
        "2026-08-02T12:30",
        "America/Detroit",
      ),
    ).toEqual([-240]);
  });

  it("rejects a daylight-saving gap and exposes both fold offsets", () => {
    expect(
      getPublishingScheduleOffsetOptions(
        "2026-03-08T02:30",
        "America/Detroit",
      ),
    ).toEqual([]);
    expect(
      getPublishingScheduleOffsetOptions(
        "2026-11-01T01:30",
        "America/Detroit",
      ),
    ).toEqual([-300, -240]);
  });
});
