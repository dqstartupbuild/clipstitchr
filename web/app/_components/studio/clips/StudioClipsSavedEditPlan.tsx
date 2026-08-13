import type { StudioClipsOutput } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsOutput";
import { formatStudioClipsDuration } from "./formatStudioClipsDuration";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsSavedEditPlanProps = {
  output: StudioClipsOutput;
};

export function StudioClipsSavedEditPlan({
  output,
}: StudioClipsSavedEditPlanProps) {
  const edit = output.edit;
  const hasPlan = Boolean(
    edit.captions ||
      edit.merge ||
      edit.projectStyle ||
      edit.regenerate.state === "requested" ||
      edit.split ||
      edit.trim,
  );

  if (!hasPlan) return null;

  return (
    <details className={styles.savedStyle}>
      <summary>Saved edit plan</summary>
      <dl>
        {edit.trim ? (
          <div>
            <dt>Trim</dt>
            <dd>{formatStudioClipsDuration(edit.trim.startSeconds)} - {formatStudioClipsDuration(edit.trim.endSeconds)}</dd>
          </div>
        ) : null}
        {edit.split ? (
          <div>
            <dt>Split points</dt>
            <dd>{edit.split.pointsSeconds.map(formatStudioClipsDuration).join(", ")}</dd>
          </div>
        ) : null}
        {edit.merge ? (
          <div>
            <dt>Merge</dt>
            <dd>{edit.merge.outputIds.length} clips</dd>
          </div>
        ) : null}
        {edit.captions ? (
          <div>
            <dt>Captions</dt>
            <dd>{edit.captions.enabled ? (edit.captions.burnIn ? "On and burned in" : "On") : "Off"}</dd>
          </div>
        ) : null}
        {edit.projectStyle ? (
          <div>
            <dt>Project style</dt>
            <dd>Saved</dd>
          </div>
        ) : null}
        {edit.regenerate.state === "requested" ? (
          <div>
            <dt>Regeneration</dt>
            <dd>{edit.regenerate.instructions ?? "Requested"}</dd>
          </div>
        ) : null}
      </dl>
    </details>
  );
}
