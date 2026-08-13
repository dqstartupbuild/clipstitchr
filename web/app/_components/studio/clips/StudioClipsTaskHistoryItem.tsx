import type { StudioClipsTaskSummary } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsTaskSummary";
import { formatStudioClipsDateTime } from "./formatStudioClipsDateTime";
import { getStudioClipsStatusLabel } from "./getStudioClipsStatusLabel";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsTaskHistoryItemProps = {
  isSelected: boolean;
  onSelect: (taskId: string) => void;
  task: StudioClipsTaskSummary;
};

export function StudioClipsTaskHistoryItem({
  isSelected,
  onSelect,
  task,
}: StudioClipsTaskHistoryItemProps) {
  return (
    <li className={styles.historyItem}>
      <button
        aria-current={isSelected ? "true" : undefined}
        type="button"
        onClick={() => onSelect(task.id)}
      >
        <span className={styles.historySource}>
          {task.sourceKind === "youtube" ? "YouTube video" : "Uploaded video"}
        </span>
        <span className={styles.historyStatus} data-status={task.status}>
          {task.archivedAt ? "Archived · " : ""}
          {getStudioClipsStatusLabel(task.status)} · {Math.round(task.progressPercent)}%
        </span>
        {task.activeRenderRevision ? (
          <span className={styles.historyStatus} data-status={task.activeRenderRevision.status}>
            New version · {getStudioClipsStatusLabel(task.activeRenderRevision.status)} · {Math.round(task.activeRenderRevision.progressPercent)}%
          </span>
        ) : null}
        <time dateTime={task.updatedAt}>{formatStudioClipsDateTime(task.updatedAt)}</time>
      </button>
    </li>
  );
}
