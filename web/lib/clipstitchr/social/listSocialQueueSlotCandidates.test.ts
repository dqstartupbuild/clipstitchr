import { describe, expect, it } from "vitest";
import { formatInTimeZone } from "date-fns-tz";
import { listSocialQueueSlotCandidates } from "./listSocialQueueSlotCandidates";

describe("listSocialQueueSlotCandidates", () => {
  it("materializes local weekly slots as UTC instants", () => {
    const [candidate] = listSocialQueueSlotCandidates({
      after: "2026-07-26T12:00:00.000Z",
      horizonDays: 7,
      slots: [{ dayOfWeek: 1, minuteOfDay: 10 * 60 }],
      timezone: "America/Detroit",
    });

    expect(candidate).toBe("2026-07-27T14:00:00.000Z");
  });

  it("skips a spring-forward local time that does not exist", () => {
    const [candidate] = listSocialQueueSlotCandidates({
      after: "2026-03-08T05:00:00.000Z",
      horizonDays: 8,
      slots: [{ dayOfWeek: 0, minuteOfDay: 2 * 60 + 30 }],
      timezone: "America/New_York",
    });

    expect(candidate).toBe("2026-03-15T06:30:00.000Z");
  });

  it("uses one real instant for a repeated fall-back wall-clock slot", () => {
    const candidates = listSocialQueueSlotCandidates({
      after: "2026-11-01T04:00:00.000Z",
      horizonDays: 1,
      slots: [{ dayOfWeek: 0, minuteOfDay: 90 }],
      timezone: "America/New_York",
    });
    const repeatedDate = candidates.filter(
      (candidate) =>
        formatInTimeZone(
          new Date(candidate),
          "America/New_York",
          "yyyy-MM-dd HH:mm",
        ) === "2026-11-01 01:30",
    );

    expect(repeatedDate).toHaveLength(1);
  });
});
