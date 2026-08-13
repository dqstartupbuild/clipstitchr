import type { StudioClipsSourceDraft } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsSourceDraft";
import { StudioClipsSourcePreview } from "./StudioClipsSourcePreview";
import { selectStudioClipsSourceFile } from "./selectStudioClipsSourceFile";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsSourcePickerProps = {
  disabled: boolean;
  onChange: (source: StudioClipsSourceDraft) => void;
  source: StudioClipsSourceDraft;
};

export function StudioClipsSourcePicker({
  disabled,
  onChange,
  source,
}: StudioClipsSourcePickerProps) {
  return (
    <fieldset className={styles.sourcePicker} disabled={disabled}>
      <legend>1. Choose one source</legend>
      <div className={styles.sourceMode}>
        <label>
          <input
            checked={source.kind === "youtube"}
            name="studio-clips-source"
            type="radio"
            onChange={() => onChange({ kind: "youtube", url: "" })}
          />
          <span>YouTube link</span>
        </label>
        <label>
          <input
            checked={source.kind === "upload"}
            name="studio-clips-source"
            type="radio"
            onChange={() => onChange({ file: null, kind: "upload" })}
          />
          <span>Local video</span>
        </label>
      </div>
      {source.kind === "youtube" ? (
        <label className={styles.field}>
          <span>YouTube video link</span>
          <input
            autoComplete="url"
            inputMode="url"
            maxLength={2_048}
            placeholder="https://www.youtube.com/watch?v=..."
            required
            type="url"
            value={source.url}
            onChange={(event) => onChange({ kind: "youtube", url: event.target.value })}
          />
          <small>HTTPS links from youtube.com or youtu.be only.</small>
        </label>
      ) : (
        <label className={styles.uploadField}>
          <span>Source video</span>
          <input
            accept="video/mp4,video/quicktime,video/webm,video/x-m4v,video/x-matroska"
            required
            type="file"
            onChange={(event) => selectStudioClipsSourceFile(event, onChange)}
          />
          <small>MP4, MOV, WebM, M4V, or MKV. Up to 1 GB and 90 minutes.</small>
        </label>
      )}
      <StudioClipsSourcePreview source={source} />
    </fieldset>
  );
}
