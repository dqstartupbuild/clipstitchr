import type { PublishingDestinationIntent } from "./PublishingDestinationIntent.js";
import type { ResolvedPublishingDestinationIntent } from "./ResolvedPublishingDestinationIntent.js";
import { parseZonedScheduleDate } from "../scheduling/parseZonedScheduleDate.js";

export const resolvePublishingDestinationIntent = (
  intent: PublishingDestinationIntent,
  now: Date,
): ResolvedPublishingDestinationIntent => {
  const nowEpochMilliseconds = now.getTime();

  if (!Number.isSafeInteger(nowEpochMilliseconds)) {
    throw new TypeError("now must be a valid Date.");
  }

  if (intent.kind === "draft") {
    return Object.freeze({
      kind: "draft",
      postState: "DRAFT",
      internalState: "DRAFT",
      databaseIntent: "DRAFT",
      publishDate: new Date(nowEpochMilliseconds),
      availableAt: null,
      scheduledTimeZone: null,
      scheduledLocalTime: null,
      scheduledUtcOffsetMinutes: null,
    });
  }

  if (intent.kind === "publish-now") {
    return Object.freeze({
      kind: "publish-now",
      postState: "QUEUE",
      internalState: "QUEUED",
      databaseIntent: "PUBLISH_NOW",
      publishDate: new Date(nowEpochMilliseconds),
      availableAt: new Date(nowEpochMilliseconds),
      scheduledTimeZone: null,
      scheduledLocalTime: null,
      scheduledUtcOffsetMinutes: null,
    });
  }

  const schedule = parseZonedScheduleDate(
    intent.schedule,
    nowEpochMilliseconds,
  );

  return Object.freeze({
    kind: "schedule",
    postState: "QUEUE",
    internalState: "QUEUED",
    databaseIntent: "SCHEDULE",
    publishDate: schedule.instant,
    availableAt: schedule.instant,
    scheduledTimeZone: schedule.timeZone,
    scheduledLocalTime: schedule.localDateTime,
    scheduledUtcOffsetMinutes: schedule.utcOffsetMinutes,
  });
};
