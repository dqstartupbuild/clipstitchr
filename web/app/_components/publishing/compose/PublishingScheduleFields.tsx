"use client";

import { useEffect, useMemo } from "react";
import { formatPublishingUtcOffset } from "@/lib/clipstitchr/publishing/client/schedule/formatPublishingUtcOffset";
import { getPublishingScheduleOffsetOptions } from "@/lib/clipstitchr/publishing/client/schedule/getPublishingScheduleOffsetOptions";
import { getPublishingTimeZones } from "@/lib/clipstitchr/publishing/client/schedule/getPublishingTimeZones";

type PublishingScheduleFieldsProps = {
  localDateTime: string;
  onLocalDateTimeChange: (value: string) => void;
  onTimeZoneChange: (value: string) => void;
  onUtcOffsetChange: (value: number | null) => void;
  timeZone: string;
  utcOffsetMinutes: number | null;
};

export function PublishingScheduleFields({
  localDateTime,
  onLocalDateTimeChange,
  onTimeZoneChange,
  onUtcOffsetChange,
  timeZone,
  utcOffsetMinutes,
}: PublishingScheduleFieldsProps) {
  const timeZones = useMemo(() => getPublishingTimeZones(timeZone), [timeZone]);
  const offsets = useMemo(
    () => getPublishingScheduleOffsetOptions(localDateTime, timeZone),
    [localDateTime, timeZone],
  );

  useEffect(() => {
    if (offsets.length === 1 && utcOffsetMinutes !== offsets[0]) {
      onUtcOffsetChange(offsets[0]);
    } else if (
      offsets.length !== 1 &&
      utcOffsetMinutes !== null &&
      !offsets.includes(utcOffsetMinutes)
    ) {
      onUtcOffsetChange(null);
    }
  }, [offsets, onUtcOffsetChange, utcOffsetMinutes]);

  return (
    <div className="publishing-schedule-fields">
      <label>
        Local date and time
        <input
          onChange={(event) => onLocalDateTimeChange(event.target.value)}
          type="datetime-local"
          value={localDateTime}
        />
      </label>
      <label>
        Time zone
        <select value={timeZone} onChange={(event) => onTimeZoneChange(event.target.value)}>
          {timeZones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </label>
      {localDateTime && offsets.length > 1 ? (
        <label>
          UTC offset for this repeated time
          <select
            value={utcOffsetMinutes ?? ""}
            onChange={(event) =>
              onUtcOffsetChange(event.target.value ? Number(event.target.value) : null)
            }
          >
            <option value="">Choose the exact offset</option>
            {offsets.map((offset) => (
              <option key={offset} value={offset}>
                {formatPublishingUtcOffset(offset)}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {localDateTime && offsets.length === 0 ? (
        <p className="publishing-inline-error" role="alert">
          This local time does not exist in {timeZone}. Choose another time.
        </p>
      ) : null}
      {localDateTime && offsets.length === 1 ? (
        <p className="publishing-schedule-summary">
          Exact offset: {formatPublishingUtcOffset(offsets[0])}
        </p>
      ) : null}
    </div>
  );
}
