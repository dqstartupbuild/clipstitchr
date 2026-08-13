import { InvalidPublishingScheduleError } from "../errors/InvalidPublishingScheduleError.js";

export type ZonedDateTimeParts = Readonly<{
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}>;

const LOCAL_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

export const readZonedDateTimeParts = (
  localDateTime: string,
): ZonedDateTimeParts => {
  const match = LOCAL_DATE_TIME_PATTERN.exec(localDateTime);

  if (match === null) {
    throw new InvalidPublishingScheduleError();
  }

  const parts = Object.freeze({
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6] ?? 0),
  });
  const roundTrip = new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    ),
  );

  if (
    parts.year < 2020 ||
    parts.year > 2200 ||
    roundTrip.getUTCFullYear() !== parts.year ||
    roundTrip.getUTCMonth() + 1 !== parts.month ||
    roundTrip.getUTCDate() !== parts.day ||
    roundTrip.getUTCHours() !== parts.hour ||
    roundTrip.getUTCMinutes() !== parts.minute ||
    roundTrip.getUTCSeconds() !== parts.second
  ) {
    throw new InvalidPublishingScheduleError();
  }

  return parts;
};
