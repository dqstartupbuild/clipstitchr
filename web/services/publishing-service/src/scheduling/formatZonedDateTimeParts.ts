import { InvalidPublishingScheduleError } from "../errors/InvalidPublishingScheduleError.js";
import type { ZonedDateTimeParts } from "./readZonedDateTimeParts.js";

export const formatZonedDateTimeParts = (
  instant: Date,
  timeZone: string,
): ZonedDateTimeParts => {
  let values: Map<string, string>;

  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      calendar: "gregory",
      numberingSystem: "latn",
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    values = new Map(
      formatter
        .formatToParts(instant)
        .filter(({ type }) => type !== "literal")
        .map(({ type, value }) => [type, value]),
    );
  } catch {
    throw new InvalidPublishingScheduleError();
  }

  const parts = Object.freeze({
    year: Number(values.get("year")),
    month: Number(values.get("month")),
    day: Number(values.get("day")),
    hour: Number(values.get("hour")),
    minute: Number(values.get("minute")),
    second: Number(values.get("second")),
  });

  if (Object.values(parts).some((value) => !Number.isSafeInteger(value))) {
    throw new InvalidPublishingScheduleError();
  }

  return parts;
};
