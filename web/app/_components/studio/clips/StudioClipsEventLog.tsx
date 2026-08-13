import type { StudioClipsTaskEvent } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsTaskEvent";
import { formatStudioClipsDateTime } from "./formatStudioClipsDateTime";
import { getStudioClipsProgressEventLabel } from "./getStudioClipsProgressEventLabel";
import { getStudioClipsStatusLabel } from "./getStudioClipsStatusLabel";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsEventLogProps = {
  events: StudioClipsTaskEvent[];
};

export function StudioClipsEventLog({ events }: StudioClipsEventLogProps) {
  return (
    <details className={styles.eventLog}>
      <summary>Processing log ({events.length})</summary>
      {events.length === 0 ? (
        <p>No processing events have been recorded.</p>
      ) : (
        <ol>
          {events.map((event, index) => (
            <li key={`${event.occurredAt}-${event.code}-${index}`}>
              <div>
                <strong>{getStudioClipsProgressEventLabel(event.code)}</strong>
                <span>{getStudioClipsStatusLabel(event.status)} · {Math.round(event.progressPercent)}%</span>
              </div>
              <time dateTime={event.occurredAt}>{formatStudioClipsDateTime(event.occurredAt)}</time>
              {event.failure ? <p>{event.failure.message}</p> : null}
            </li>
          ))}
        </ol>
      )}
    </details>
  );
}
