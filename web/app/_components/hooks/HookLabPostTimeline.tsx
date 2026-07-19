import type { HookLabPostTimelineEntry } from "@/lib/clipstitchr/types/HookLabPostTimelineEntry";
import { formatHookLabTimelineTime } from "@/lib/clipstitchr/utils/formatHookLabTimelineTime";

export function HookLabPostTimeline({
  timeline,
}: {
  timeline: HookLabPostTimelineEntry[];
}) {
  return (
    <ol className="grid gap-5">
      {timeline.map((entry, index) => (
        <li
          className="grid gap-2 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-5"
          key={`${entry.startSeconds}-${entry.endSeconds}-${index}`}
        >
          <p className="font-semibold tabular-nums text-[#3f554a]">
            {formatHookLabTimelineTime(entry.startSeconds)}-
            {formatHookLabTimelineTime(entry.endSeconds)}
          </p>
          <div>
            <p className="text-sm leading-6 text-text-primary">
              {entry.visual}
            </p>
            {entry.onScreenText ? (
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                <span className="font-semibold text-text-primary">
                  On screen:
                </span>{" "}
                {entry.onScreenText}
              </p>
            ) : null}
            {entry.audio ? (
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                <span className="font-semibold text-text-primary">Audio:</span>{" "}
                {entry.audio}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
