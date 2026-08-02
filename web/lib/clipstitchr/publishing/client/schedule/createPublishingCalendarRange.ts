import { addPublishingCalendarDays } from "@/lib/clipstitchr/publishing/client/schedule/addPublishingCalendarDays";
import { getPublishingScheduleEpochMilliseconds } from "@/lib/clipstitchr/publishing/client/schedule/getPublishingScheduleEpochMilliseconds";
import { getPublishingScheduleOffsetOptions } from "@/lib/clipstitchr/publishing/client/schedule/getPublishingScheduleOffsetOptions";
import { getPublishingWeekStart } from "@/lib/clipstitchr/publishing/client/schedule/getPublishingWeekStart";

export function createPublishingCalendarRange(
  anchorDate: string,
  timeZone: string,
) {
  const startDate = getPublishingWeekStart(anchorDate);
  const endDate = addPublishingCalendarDays(startDate, 7);
  const startOffset = getPublishingScheduleOffsetOptions(
    `${startDate}T00:00`,
    timeZone,
  )[0];
  const endOffset = getPublishingScheduleOffsetOptions(
    `${endDate}T00:00`,
    timeZone,
  )[0];
  if (startOffset === undefined || endOffset === undefined) {
    return null;
  }
  const startEpoch = getPublishingScheduleEpochMilliseconds(
    `${startDate}T00:00`,
    startOffset,
  );
  const endEpoch = getPublishingScheduleEpochMilliseconds(
    `${endDate}T00:00`,
    endOffset,
  );
  if (startEpoch === null || endEpoch === null) {
    return null;
  }
  return {
    dayDates: Array.from({ length: 7 }, (_, index) =>
      addPublishingCalendarDays(startDate, index),
    ),
    from: new Date(startEpoch).toISOString(),
    to: new Date(endEpoch).toISOString(),
  };
}
