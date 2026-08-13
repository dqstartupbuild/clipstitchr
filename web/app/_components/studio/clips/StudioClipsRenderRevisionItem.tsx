"use client";

import type { StudioClipsRenderRevisionSummary } from "@/lib/clipstitchr/types/studioClips/StudioClipsRenderRevisionSummary";
import { useStudioClipsRenderRevisionActions } from "@/lib/clipstitchr/hooks/studioClips/useStudioClipsRenderRevisionActions";
import { formatStudioClipsDateTime } from "./formatStudioClipsDateTime";
import { getStudioClipsRenderOperationLabel } from "./getStudioClipsRenderOperationLabel";
import { getStudioClipsStatusLabel } from "./getStudioClipsStatusLabel";
import { runStudioClipsRenderRevisionAction } from "./runStudioClipsRenderRevisionAction";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsRenderRevisionItemProps = {
  hasActiveProductWork: boolean;
  onUpdated: () => void;
  processingAvailable: boolean;
  productId: string;
  revision: StudioClipsRenderRevisionSummary;
};

export function StudioClipsRenderRevisionItem({
  hasActiveProductWork,
  onUpdated,
  processingAvailable,
  productId,
  revision,
}: StudioClipsRenderRevisionItemProps) {
  const actions = useStudioClipsRenderRevisionActions(productId);
  const isActive = ["queued", "processing"].includes(revision.status);
  const canResume = ["cancelled", "error", "provider_unavailable"].includes(
    revision.status,
  );
  const progress = Math.max(0, Math.min(100, revision.progressPercent));
  const resumeUnavailableId = `revision-resume-${revision.id}`;

  return (
    <li className={styles.renderRevisionItem} data-status={revision.status}>
      <header>
        <div>
          <strong>{getStudioClipsRenderOperationLabel(revision)}</strong>
          <span>{getStudioClipsStatusLabel(revision.status)}</span>
        </div>
        <time dateTime={revision.updatedAt}>
          {formatStudioClipsDateTime(revision.updatedAt)}
        </time>
      </header>
      <div
        aria-label={`${Math.round(progress)} percent complete`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(progress)}
        className={styles.revisionProgress}
        role="progressbar"
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <p>
        {revision.outputIds.length > 0
          ? `${revision.outputIds.length} finished output${revision.outputIds.length === 1 ? "" : "s"}`
          : `Attempt ${revision.attempt} · ${Math.round(progress)}%`}
      </p>
      {revision.failure ? (
        <p className={styles.inlineError} role="alert">
          {revision.failure.message}
        </p>
      ) : null}
      <div className={styles.revisionActions}>
        {isActive ? (
          <button
            disabled={actions.busyAction !== null}
            onClick={() => void runStudioClipsRenderRevisionAction(revision, "cancel", actions.updateRevision, onUpdated)}
            type="button"
          >
            {actions.busyAction === "cancel" ? "Canceling..." : "Cancel render"}
          </button>
        ) : null}
        {canResume ? (
          <button
            aria-describedby={hasActiveProductWork || !processingAvailable ? resumeUnavailableId : undefined}
            disabled={actions.busyAction !== null || hasActiveProductWork || !processingAvailable}
            onClick={() => void runStudioClipsRenderRevisionAction(revision, "resume", actions.updateRevision, onUpdated)}
            type="button"
          >
            {actions.busyAction === "resume" ? "Resuming..." : "Resume render"}
          </button>
        ) : null}
      </div>
      {canResume && (hasActiveProductWork || !processingAvailable) ? (
        <p id={resumeUnavailableId} role="status">
          {hasActiveProductWork
            ? "Finish the active clip job before resuming this render."
            : "Resume is unavailable until clip processing is enabled."}
        </p>
      ) : null}
      {actions.busyAction ? <p role="status">Updating this render...</p> : null}
      {actions.error ? (
        <p className={styles.inlineError} role="alert">
          {actions.error}
        </p>
      ) : null}
      <details>
        <summary>Technical record</summary>
        <code>{revision.id}</code>
      </details>
    </li>
  );
}
