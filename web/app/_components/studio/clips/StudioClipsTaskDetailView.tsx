"use client";

import type { StudioClipsCapabilities } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsCapabilities";
import type { StudioClipsTaskDetail } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsTaskDetail";
import { useStudioClipsTaskActions } from "@/lib/clipstitchr/hooks/studioClips/useStudioClipsTaskActions";
import { StudioClipsEventLog } from "./StudioClipsEventLog";
import { StudioClipsAnalysisView } from "./StudioClipsAnalysisView";
import { StudioClipsOutputs } from "./StudioClipsOutputs";
import { StudioClipsProgress } from "./StudioClipsProgress";
import { StudioClipsRenderRevisionHistory } from "./StudioClipsRenderRevisionHistory";
import { StudioClipsTaskActions } from "./StudioClipsTaskActions";
import { formatStudioClipsDateTime } from "./formatStudioClipsDateTime";
import { getStudioClipsSourceLabel } from "./getStudioClipsSourceLabel";
import { runStudioClipsTaskAction } from "./runStudioClipsTaskAction";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsTaskDetailViewProps = {
  capabilities: StudioClipsCapabilities;
  hasActiveProductWork: boolean;
  onArchived: () => void;
  onUpdated: () => void;
  productId: string;
  task: StudioClipsTaskDetail;
};

export function StudioClipsTaskDetailView({
  capabilities,
  hasActiveProductWork,
  onArchived,
  onUpdated,
  productId,
  task,
}: StudioClipsTaskDetailViewProps) {
  const actions = useStudioClipsTaskActions(productId);
  const captionStyle = task.options.captionStyle;

  return (
    <section className={styles.taskDetail} aria-labelledby="studio-clips-task-title">
      <header className={styles.taskHeading}>
        <div>
          <p>{getStudioClipsSourceLabel(task.source)}</p>
          <h2 id="studio-clips-task-title">Task detail</h2>
        </div>
        <time dateTime={task.createdAt}>{formatStudioClipsDateTime(task.createdAt)}</time>
      </header>
      <StudioClipsProgress task={task} />
      {task.status === "provider_unavailable" ? (
        <div className={styles.honestState} role="status">
          <strong>No render was started.</strong>
          <p>
            This saved task did not reach processing. Your source and choices
            remain saved, and the reason appears below.
          </p>
        </div>
      ) : null}
      {task.failure ? (
        <div className={styles.failure} role="alert">
          <strong>{task.failure.kind === "retryable" ? "This task can be retried" : "This task cannot be retried as-is"}</strong>
          <p>{task.failure.message}</p>
          <span>Reference: {task.failure.code}</span>
        </div>
      ) : null}
      <dl className={styles.taskFacts}>
        <div><dt>Framing</dt><dd>{task.options.outputFormat === "vertical" ? "Vertical 9:16" : "Original framing"}</dd></div>
        <div><dt>Subtitles</dt><dd>{task.options.addSubtitles ? "Requested" : "Off"}</dd></div>
        <div><dt>B-roll</dt><dd>{task.options.includeBroll ? "Requested" : "Off"}</dd></div>
        <div><dt>Outputs</dt><dd>{task.outputCount}</dd></div>
      </dl>
      {captionStyle ? (
        <details className={styles.savedStyle}>
          <summary>Saved caption look</summary>
          <dl>
            <div><dt>Template</dt><dd>{captionStyle.templateId}</dd></div>
            <div><dt>Font</dt><dd>{captionStyle.fontFamily ?? "Template default"}</dd></div>
            <div><dt>Size</dt><dd>{captionStyle.fontSizePx ? `${captionStyle.fontSizePx}px` : "Template default"}</dd></div>
            <div><dt>Color</dt><dd>{captionStyle.fontColorHex ?? "Template default"}</dd></div>
          </dl>
          <p>
            {capabilities.captionStyle.execution === "rendered"
              ? "Applied when captions are burned into the finished clips."
              : "Saved with this task. The current processor does not apply this caption look yet."}
          </p>
        </details>
      ) : null}
      <StudioClipsTaskActions
        busyAction={actions.busyAction}
        hasActiveProductWork={hasActiveProductWork}
        onAction={(action) => void runStudioClipsTaskAction(task.id, action, actions.updateTask, onArchived, onUpdated)}
        processingAvailable={capabilities.execution.state === "available"}
        task={task}
      />
      {actions.error ? <p className={styles.inlineError} role="alert">{actions.error}</p> : null}
      <StudioClipsEventLog events={task.events} />
      <StudioClipsAnalysisView capabilities={capabilities} task={task} />
      <StudioClipsRenderRevisionHistory
        hasActiveProductWork={hasActiveProductWork}
        onUpdated={onUpdated}
        processingAvailable={capabilities.execution.state === "available"}
        productId={productId}
        revisions={task.renderRevisions}
      />
      <StudioClipsOutputs
        capabilities={capabilities}
        hasActiveProductWork={hasActiveProductWork}
        onUpdated={onUpdated}
        outputs={task.outputs}
        productId={productId}
        taskId={task.id}
      />
    </section>
  );
}
