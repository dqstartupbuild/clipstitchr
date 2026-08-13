import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { StudioStitchRecipeDraft } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchRecipeDraft";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

export function StudioStitchMusicField({
  draft,
  tracks,
  onChange,
}: {
  draft: StudioStitchRecipeDraft;
  tracks: readonly SharedMusicTrack[];
  onChange: (patch: Partial<StudioStitchRecipeDraft>) => void;
}) {
  return (
    <div className={styles.musicFields}>
      <label className={styles.field}>
        Music bed
        <select
          onChange={(event) => onChange({ musicTrackId: event.target.value })}
          value={draft.musicTrackId}
        >
          <option value="">No music</option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>{track.title} · {track.durationSeconds.toFixed(0)}s</option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        Music level: {Math.round(draft.musicVolume * 100)}%
        <input
          max={1}
          min={0}
          onChange={(event) => onChange({ musicVolume: Number(event.target.value) })}
          step={0.05}
          type="range"
          value={draft.musicVolume}
        />
      </label>
    </div>
  );
}
