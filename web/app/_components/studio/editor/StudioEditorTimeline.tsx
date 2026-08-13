import { StudioEditorTimelineTrack } from "@/app/_components/studio/editor/StudioEditorTimelineTrack";
import { getStudioEditorActiveScene } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorActiveScene";
import type { StudioEditorProjectV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectV1";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorTimelineProps = {
  durationSeconds: number;
  onSeek: (seconds: number) => void;
  onSelect: (layerId: string) => void;
  playheadSeconds: number;
  project: StudioEditorProjectV1;
  selectedLayerId: string | null;
};

export function StudioEditorTimeline({
  durationSeconds,
  onSeek,
  onSelect,
  playheadSeconds,
  project,
  selectedLayerId,
}: StudioEditorTimelineProps) {
  const scene = getStudioEditorActiveScene(project);
  const total = Math.max(durationSeconds, 1 / project.canvas.fps);

  return (
    <section className={styles.timelinePanel} aria-labelledby="timeline-title">
      <div className={styles.panelHeading}>
        <div>
          <h2 id="timeline-title">Timeline</h2>
          <p>Click a lane to move the playhead. Choose a layer to edit it.</p>
        </div>
      </div>
      <div className={styles.timelineScroll}>
        <div className={styles.timelineLanes}>
          <div aria-hidden="true" className={styles.timelinePlayheadRail}>
            <span
              className={styles.timelinePlayhead}
              style={{ left: `${(playheadSeconds / total) * 100}%` }}
            />
          </div>
          {scene.tracks.map((track) => (
            <StudioEditorTimelineTrack
              key={track.id}
              durationSeconds={total}
              fps={project.canvas.fps}
              selectedLayerId={selectedLayerId}
              track={track}
              onSeek={onSeek}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
