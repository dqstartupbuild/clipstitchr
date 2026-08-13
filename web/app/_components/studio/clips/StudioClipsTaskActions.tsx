import type { StudioClipsTaskAction } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsTaskAction";
import type { StudioClipsTaskDetail } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsTaskDetail";
import { getStudioClipsTaskIsActive } from "@/lib/clipstitchr/hooks/studioClips/getStudioClipsTaskIsActive";
import { StudioClipsDeleteTaskControl } from "./StudioClipsDeleteTaskControl";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsTaskActionsProps = {
  busyAction: StudioClipsTaskAction | null;
  hasActiveProductWork: boolean;
  onAction: (action: StudioClipsTaskAction) => void;
  processingAvailable: boolean;
  task: StudioClipsTaskDetail;
};

export function StudioClipsTaskActions({
  busyAction,
  hasActiveProductWork,
  onAction,
  processingAvailable,
  task,
}: StudioClipsTaskActionsProps) {
  const isActive = getStudioClipsTaskIsActive(task.status);
  const canResume =
    !task.archivedAt &&
    ["cancelled", "error", "provider_unavailable"].includes(task.status);
  const resumeBlocked = hasActiveProductWork || !processingAvailable;
  const resumeStatusId = `studio-clips-task-resume-${task.id}`;

  return (
    <div className={styles.taskActions}>
      {isActive ? (
        <button disabled={Boolean(busyAction)} type="button" onClick={() => onAction("cancel")}>
          {busyAction === "cancel" ? "Cancelling..." : "Cancel task"}
        </button>
      ) : null}
      {canResume ? (
        <button
          aria-describedby={resumeBlocked ? resumeStatusId : undefined}
          disabled={Boolean(busyAction) || resumeBlocked}
          type="button"
          onClick={() => onAction("resume")}
        >
          {busyAction === "resume"
            ? "Saving..."
            : "Resume task"}
        </button>
      ) : null}
      {canResume && resumeBlocked ? (
        <p id={resumeStatusId} role="status">
          {hasActiveProductWork
            ? "Finish the active clip job before resuming this task."
            : "Resume is unavailable until clip processing is enabled."}
        </p>
      ) : null}
      {!isActive && !task.archivedAt ? (
        <StudioClipsDeleteTaskControl
          busy={Boolean(busyAction)}
          onDelete={() => onAction("archive")}
        />
      ) : null}
      {task.archivedAt ? <p role="status">This task is archived.</p> : null}
      {busyAction ? <p role="status">Updating this task...</p> : null}
    </div>
  );
}
