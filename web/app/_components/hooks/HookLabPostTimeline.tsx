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
          <p className="font-semibold tabular-nums text-accent-dark">
            {formatHookLabTimelineTime(entry.startSeconds)}-
            {formatHookLabTimelineTime(entry.endSeconds)}
          </p>
          <div>
            <p className="text-sm leading-6 text-text-primary">
              {entry.visual}
            </p>
            {entry.facialExpressionAndBodyLanguage ? (
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                <span className="font-semibold text-text-primary">
                  Expression and body language:
                </span>{" "}
                {entry.facialExpressionAndBodyLanguage}
              </p>
            ) : null}
            {entry.objectsAndPlacement ? (
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                <span className="font-semibold text-text-primary">
                  Objects and placement:
                </span>{" "}
                {entry.objectsAndPlacement}
              </p>
            ) : null}
            {entry.actionsAndReactions ? (
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                <span className="font-semibold text-text-primary">
                  Actions and reactions:
                </span>{" "}
                {entry.actionsAndReactions}
              </p>
            ) : null}
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
            {entry.editingAndSound ? (
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                <span className="font-semibold text-text-primary">
                  Cuts and sound:
                </span>{" "}
                {entry.editingAndSound}
              </p>
            ) : null}
            {entry.likelySubtext ? (
              <p className="mt-3 rounded-lg bg-surface-muted p-3 text-sm leading-6 text-text-secondary">
                <span className="font-semibold text-text-primary">
                  Likely meaning:
                </span>{" "}
                {entry.likelySubtext}
              </p>
            ) : null}
            {entry.recreationEssentials ? (
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                <span className="font-semibold text-text-primary">
                  Essential to the effect:
                </span>{" "}
                {entry.recreationEssentials}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
