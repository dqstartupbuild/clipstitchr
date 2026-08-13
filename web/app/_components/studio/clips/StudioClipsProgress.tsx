import type { StudioClipsTaskDetail } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsTaskDetail";
import { getStudioClipsCheckpointLabel } from "./getStudioClipsCheckpointLabel";
import { getStudioClipsStatusLabel } from "./getStudioClipsStatusLabel";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsProgressProps = {
  task: StudioClipsTaskDetail;
};

export function StudioClipsProgress({ task }: StudioClipsProgressProps) {
  const progress = Math.max(0, Math.min(100, task.progressPercent));

  return (
    <section className={styles.progressSection} aria-labelledby="studio-clips-progress-title">
      <div>
        <h3 id="studio-clips-progress-title">{getStudioClipsStatusLabel(task.status)}</h3>
        <p>{getStudioClipsCheckpointLabel(task.checkpoint)}</p>
      </div>
      <div
        aria-label={`${Math.round(progress)} percent complete`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(progress)}
        className={styles.progressTrack}
        role="progressbar"
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <strong>{Math.round(progress)}%</strong>
    </section>
  );
}
