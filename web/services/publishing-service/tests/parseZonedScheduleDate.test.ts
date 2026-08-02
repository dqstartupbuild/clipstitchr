import { describe, expect, it } from "vitest";

import { InvalidPublishingScheduleError } from "../src/errors/InvalidPublishingScheduleError.js";
import { parseZonedScheduleDate } from "../src/scheduling/parseZonedScheduleDate.js";

const NOW = Date.parse("2026-01-01T00:00:00Z");

describe("parseZonedScheduleDate", () => {
  it("preserves an exact Detroit wall time and its UTC instant", () => {
    const schedule = parseZonedScheduleDate(
      {
        localDateTime: "2026-08-15T09:45",
        timeZone: "America/Detroit",
        utcOffsetMinutes: -240,
      },
      NOW,
    );

    expect(schedule).toMatchObject({
      localDateTime: "2026-08-15T09:45:00",
      timeZone: "America/Detroit",
      utcOffsetMinutes: -240,
    });
    expect(schedule.instant.toISOString()).toBe("2026-08-15T13:45:00.000Z");
  });

  it("uses the supplied offset to disambiguate a repeated fall-back time", () => {
    const daylight = parseZonedScheduleDate(
      {
        localDateTime: "2026-11-01T01:30",
        timeZone: "America/Detroit",
        utcOffsetMinutes: -240,
      },
      NOW,
    );
    const standard = parseZonedScheduleDate(
      {
        localDateTime: "2026-11-01T01:30",
        timeZone: "America/Detroit",
        utcOffsetMinutes: -300,
      },
      NOW,
    );

    expect(daylight.instant.toISOString()).toBe("2026-11-01T05:30:00.000Z");
    expect(standard.instant.toISOString()).toBe("2026-11-01T06:30:00.000Z");
  });

  it("rejects a nonexistent spring-forward time", () => {
    expect(() =>
      parseZonedScheduleDate(
        {
          localDateTime: "2026-03-08T02:30",
          timeZone: "America/Detroit",
          utcOffsetMinutes: -300,
        },
        NOW,
      ),
    ).toThrow(InvalidPublishingScheduleError);
  });

  it("rejects a mismatched offset, invalid zone, invalid date, or past time", () => {
    const invalidInputs = [
      {
        localDateTime: "2026-08-15T09:45",
        timeZone: "America/Detroit",
        utcOffsetMinutes: -300,
      },
      {
        localDateTime: "2026-08-15T09:45",
        timeZone: "Not/A_Zone",
        utcOffsetMinutes: -240,
      },
      {
        localDateTime: "2026-02-30T09:45",
        timeZone: "UTC",
        utcOffsetMinutes: 0,
      },
      {
        localDateTime: "2025-12-31T23:59",
        timeZone: "UTC",
        utcOffsetMinutes: 0,
      },
    ];

    for (const input of invalidInputs) {
      expect(() => parseZonedScheduleDate(input, NOW)).toThrow(
        InvalidPublishingScheduleError,
      );
    }
  });
});
