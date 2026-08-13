import type { StudioBetaWorkspaceMediaCard } from "@/lib/clipstitchr/types/StudioBetaWorkspaceMediaCard";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import styles from "@/app/dashboard/studio/studioBetaWorkspace.module.css";

type StudioBetaTimelineProps = {
  media: StudioBetaWorkspaceMediaCard[];
  sourceCount: number;
  stitchCount: number;
};

export function StudioBetaTimeline({
  media,
  sourceCount,
  stitchCount,
}: StudioBetaTimelineProps) {
  return (
    <section aria-labelledby="studio-timeline" className={styles.timelineSection}>
      <div className={styles.timelineSummary}>
        <h2 id="studio-timeline">Assembly line</h2>
        <dl>
          <div>
            <dt>Sources</dt>
            <dd>{sourceCount}</dd>
          </div>
          <div>
            <dt>Finished</dt>
            <dd>{stitchCount}</dd>
          </div>
        </dl>
      </div>
      <div className={styles.timelineTrack}>
        <span aria-hidden className={styles.playhead} />
        <ol>
          {media.slice(0, 5).map((item) => (
            <li key={`${item.kind}:${item.id}`}>
              <span className={styles.timelineIndex}>
                {item.kind === "stitch" ? "CUT" : "SRC"}
              </span>
              <span className={styles.timelineName}>{item.name}</span>
              <span className={styles.timelineDuration}>
                {formatDuration(item.duration)}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
