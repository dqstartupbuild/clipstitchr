import type { StudioClipsTaskOptions } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsTaskOptions";
import type { StudioClipsCapabilities } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsCapabilities";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsProcessingOptionsProps = {
  capabilities: StudioClipsCapabilities;
  disabled: boolean;
  onChange: (options: StudioClipsTaskOptions) => void;
  options: StudioClipsTaskOptions;
};

export function StudioClipsProcessingOptions({
  capabilities,
  disabled,
  onChange,
  options,
}: StudioClipsProcessingOptionsProps) {
  return (
    <fieldset className={styles.processingOptions} disabled={disabled}>
      <legend>2. Set the cut</legend>
      <div className={styles.framingChoice}>
        {capabilities.outputFormats.map((format) => {
          const canSelect = format.state === "available" && (format.id === "vertical" || format.id === "source");
          return (
            <label key={format.id}>
              <input
                checked={canSelect && options.outputFormat === format.id}
                disabled={!canSelect}
                name="studio-clips-framing"
                type="radio"
                onChange={() => {
                  if (format.id === "vertical" || format.id === "source") {
                    onChange({ ...options, outputFormat: format.id });
                  }
                }}
              />
              <span>
                <strong>{format.label}</strong>
                {format.message ?? (format.id === "vertical" ? "Reframe for short-form feeds." : "Keep the source shape.")}
              </span>
            </label>
          );
        })}
      </div>
      <label className={styles.switchRow}>
        <span><strong>Add subtitles</strong><small>Save a request for burned-in captions.</small></span>
        <input
          checked={options.addSubtitles}
          type="checkbox"
          onChange={(event) => onChange({ ...options, addSubtitles: event.target.checked })}
        />
      </label>
      <label className={styles.switchRow}>
        <span><strong>Include B-roll</strong><small>Ask the processor to gather supporting visuals.</small></span>
        <input
          checked={options.includeBroll}
          type="checkbox"
          onChange={(event) => onChange({ ...options, includeBroll: event.target.checked })}
        />
      </label>
    </fieldset>
  );
}
