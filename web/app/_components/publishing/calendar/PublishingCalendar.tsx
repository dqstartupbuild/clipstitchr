"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PublishingCalendarDay } from "@/app/_components/publishing/calendar/PublishingCalendarDay";
import { PublishingStateMessage } from "@/app/_components/publishing/common/PublishingStateMessage";
import { PublishingViewHeader } from "@/app/_components/publishing/common/PublishingViewHeader";
import { getPublishingCalendar } from "@/lib/clipstitchr/publishing/client/requests/getPublishingCalendar";
import { addPublishingCalendarDays } from "@/lib/clipstitchr/publishing/client/schedule/addPublishingCalendarDays";
import { createPublishingCalendarRange } from "@/lib/clipstitchr/publishing/client/schedule/createPublishingCalendarRange";
import { getPublishingDateInTimeZone } from "@/lib/clipstitchr/publishing/client/schedule/getPublishingDateInTimeZone";
import { useBrowserTimeZone } from "@/lib/clipstitchr/publishing/client/schedule/useBrowserTimeZone";
import { usePublishingResource } from "@/lib/clipstitchr/publishing/client/usePublishingResource";
import type { PublishingPostSummary } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostSummary";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";

type PublishingCalendarProps = {
  initialDate: string;
  initialDateIsExplicit: boolean;
};

export function PublishingCalendar({
  initialDate,
  initialDateIsExplicit,
}: PublishingCalendarProps) {
  const { activeProduct, activeProductId } = useDashboardProduct();
  const [selectedDate, setSelectedDate] = useState<string | null>(
    initialDateIsExplicit ? initialDate : null,
  );
  const timeZone = useBrowserTimeZone();
  const anchorDate =
    selectedDate ??
    (timeZone ? getPublishingDateInTimeZone(timeZone) : initialDate);

  const range = useMemo(
    () => (timeZone ? createPublishingCalendarRange(anchorDate, timeZone) : null),
    [anchorDate, timeZone],
  );
  const resource = usePublishingResource(
    (signal) => {
      if (!range || !timeZone) {
        return Promise.reject(new Error("Calendar time zone is unavailable."));
      }
      return getPublishingCalendar(
        { from: range.from, timeZone, to: range.to },
        activeProductId ?? "",
        signal,
      );
    },
    range && timeZone && activeProductId
      ? `${activeProductId}:${range.from}:${range.to}:${timeZone}`
      : null,
  );

  const postsByDate = useMemo(() => {
    const grouped = new Map<string, PublishingPostSummary[]>();
    for (const post of resource.data?.posts ?? []) {
      if (!post.scheduledAt || !timeZone) {
        continue;
      }
      const date = getPublishingDateInTimeZone(
        timeZone,
        new Date(post.scheduledAt),
      );
      grouped.set(date, [...(grouped.get(date) ?? []), post]);
    }
    return grouped;
  }, [resource.data, timeZone]);

  return (
    <section className="publishing-view" aria-labelledby="publishing-calendar-title">
      <PublishingViewHeader
        action={
          <Link className="publishing-primary-action" href="/dashboard/studio/publishing/compose">
            Create post
          </Link>
        }
        description={`See when ${activeProduct?.name ?? "this Product"} is due to publish, in your local time zone.`}
        title="Calendar"
        titleId="publishing-calendar-title"
      />

      <div className="publishing-calendar-controls" aria-label="Calendar week">
        <button
          type="button"
          onClick={() =>
            setSelectedDate(addPublishingCalendarDays(anchorDate, -7))
          }
        >
          Previous week
        </button>
        <button
          type="button"
          onClick={() =>
            setSelectedDate(getPublishingDateInTimeZone(timeZone ?? "UTC"))
          }
        >
          This week
        </button>
        <button
          type="button"
          onClick={() =>
            setSelectedDate(addPublishingCalendarDays(anchorDate, 7))
          }
        >
          Next week
        </button>
        <span>{timeZone ? `Times shown in ${timeZone}` : "Finding your time zone"}</span>
      </div>

      {resource.error ? (
        <PublishingStateMessage
          action={
            <button className="publishing-text-action" type="button" onClick={resource.reload}>
              Try again
            </button>
          }
          message={resource.error}
          title="Calendar could not load"
          tone="error"
        />
      ) : resource.isLoading || !range || !timeZone ? (
        <PublishingStateMessage
          message="Loading your saved schedules."
          title="Loading calendar"
        />
      ) : (
        <div className="publishing-calendar-grid" aria-busy={resource.isLoading}>
          {range.dayDates.map((date) => (
            <PublishingCalendarDay
              date={date}
              key={date}
              posts={postsByDate.get(date) ?? []}
              timeZone={timeZone}
            />
          ))}
        </div>
      )}
    </section>
  );
}
