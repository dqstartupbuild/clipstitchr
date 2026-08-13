import { InvalidPublishingScheduleError } from "../errors/InvalidPublishingScheduleError.js";
import type { ZonedScheduleDate } from "./ZonedScheduleDate.js";
import type { ZonedScheduleDateInput } from "./ZonedScheduleDateInput.js";
import { formatZonedDateTimeParts } from "./formatZonedDateTimeParts.js";
import { readZonedDateTimeParts } from "./readZonedDateTimeParts.js";
import { zonedDateTimePartsMatch } from "./zonedDateTimePartsMatch.js";

export const parseZonedScheduleDate = (
  input: ZonedScheduleDateInput,
  nowEpochMilliseconds = Date.now(),
): ZonedScheduleDate => {
  const localParts = readZonedDateTimeParts(input.localDateTime);
  const timeZone = input.timeZone.trim();

  if (
    timeZone.length === 0 ||
    timeZone.length > 128 ||
    !Number.isSafeInteger(input.utcOffsetMinutes) ||
    input.utcOffsetMinutes < -840 ||
    input.utcOffsetMinutes > 840 ||
    !Number.isSafeInteger(nowEpochMilliseconds)
  ) {
    throw new InvalidPublishingScheduleError();
  }

  const localEpochMilliseconds = Date.UTC(
    localParts.year,
    localParts.month - 1,
    localParts.day,
    localParts.hour,
    localParts.minute,
    localParts.second,
  );
  const instant = new Date(
    localEpochMilliseconds - input.utcOffsetMinutes * 60_000,
  );
  const formattedParts = formatZonedDateTimeParts(instant, timeZone);
  const observedOffsetMinutes = Math.round(
    (Date.UTC(
      formattedParts.year,
      formattedParts.month - 1,
      formattedParts.day,
      formattedParts.hour,
      formattedParts.minute,
      formattedParts.second,
    ) -
      instant.getTime()) /
      60_000,
  );

  if (
    !zonedDateTimePartsMatch(localParts, formattedParts) ||
    observedOffsetMinutes !== input.utcOffsetMinutes ||
    instant.getTime() <= nowEpochMilliseconds
  ) {
    throw new InvalidPublishingScheduleError();
  }

  const canonicalTimeZone = new Intl.DateTimeFormat("en", {
    timeZone,
  }).resolvedOptions().timeZone;

  return Object.freeze({
    instant,
    localDateTime: [
      String(localParts.year).padStart(4, "0"),
      "-",
      String(localParts.month).padStart(2, "0"),
      "-",
      String(localParts.day).padStart(2, "0"),
      "T",
      String(localParts.hour).padStart(2, "0"),
      ":",
      String(localParts.minute).padStart(2, "0"),
      ":",
      String(localParts.second).padStart(2, "0"),
    ].join(""),
    timeZone: canonicalTimeZone,
    utcOffsetMinutes: input.utcOffsetMinutes,
  });
};
