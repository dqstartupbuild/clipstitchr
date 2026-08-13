import { StudioClipsTaskHistoryItem } from "./StudioClipsTaskHistoryItem";
import type { StudioClipsTaskSummary } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsTaskSummary";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsTaskHistoryProps = {
  error: string | null;
  includeArchived: boolean;
  onIncludeArchivedChange: (value: boolean) => void;
  onSelect: (taskId: string) => void;
  selectedTaskId: string | null;
  tasks: StudioClipsTaskSummary[] | null;
};

export function StudioClipsTaskHistory({
  error,
  includeArchived,
  onIncludeArchivedChange,
  onSelect,
  selectedTaskId,
  tasks,
}: StudioClipsTaskHistoryProps) {
  return (
    <section className={styles.history} aria-labelledby="studio-clips-history-title">
      <div className={styles.historyHeading}>
        <h2 id="studio-clips-history-title">Task history</h2>
        <label>
          <input
            checked={includeArchived}
            type="checkbox"
            onChange={(event) => onIncludeArchivedChange(event.target.checked)}
          />
          Show archived
        </label>
      </div>
      {error ? <p className={styles.inlineError} role="alert">{error}</p> : null}
      {tasks === null ? (
        <p className={styles.loadingLine} role="status">Reading the task log...</p>
      ) : tasks.length === 0 ? (
        <p className={styles.emptyHistory}>No clip tasks belong to this Product yet.</p>
      ) : (
        <ol className={styles.historyList}>
          {tasks.map((task) => (
            <StudioClipsTaskHistoryItem
              key={task.id}
              isSelected={selectedTaskId === task.id}
              onSelect={onSelect}
              task={task}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
