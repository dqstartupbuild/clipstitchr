import type { PublishingApiCreatePostRequest } from "./PublishingApiCreatePostRequest.js";
import { assertExactPublishingApiKeys } from "./assertExactPublishingApiKeys.js";
import { isPublishingApiTimeZone } from "./isPublishingApiTimeZone.js";
import { readPublishingApiRecord } from "./readPublishingApiRecord.js";
import { throwInvalidPublishingApiPostRequest } from "./throwInvalidPublishingApiPostRequest.js";

export const readPublishingApiSchedule = (
  value: unknown,
): NonNullable<PublishingApiCreatePostRequest["schedule"]> => {
  const schedule = readPublishingApiRecord(value, "invalid_post_request");
  assertExactPublishingApiKeys(
    schedule,
    ["localDateTime", "timeZone", "utcOffsetMinutes"],
    [],
    "invalid_post_request",
  );
  if (
    typeof schedule["localDateTime"] !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/u.test(schedule["localDateTime"]) ||
    !isPublishingApiTimeZone(schedule["timeZone"]) ||
    !Number.isInteger(schedule["utcOffsetMinutes"]) ||
    (schedule["utcOffsetMinutes"] as number) < -840 ||
    (schedule["utcOffsetMinutes"] as number) > 840
  ) {
    return throwInvalidPublishingApiPostRequest();
  }
  return Object.freeze({
    localDateTime: schedule["localDateTime"],
    timeZone: schedule["timeZone"],
    utcOffsetMinutes: schedule["utcOffsetMinutes"] as number,
  });
};
