import type { StudioStitchRecipeDraft } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchRecipeDraft";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

export function StudioStitchPipelinePicker({
  value,
  onChange,
}: {
  value: StudioStitchRecipeDraft["pipeline"];
  onChange: (value: StudioStitchRecipeDraft["pipeline"]) => void;
}) {
  return (
    <fieldset className={styles.pipelinePicker}>
      <legend>2. Pick the cut</legend>
      <div>
        <label>
          <input
            checked={value === "classicReel"}
            name="pipeline"
            onChange={() => onChange("classicReel")}
            type="radio"
          />
          <span>
            <strong>Classic reel</strong>
            <small>One reaction, one demo, up to three cutaways.</small>
          </span>
        </label>
        <label>
          <input
            checked={value === "talkingVideo"}
            name="pipeline"
            onChange={() => onChange("talkingVideo")}
            type="radio"
          />
          <span>
            <strong>Talking video</strong>
            <small>Five continuous reaction beats, two demo beats, timed voice.</small>
          </span>
        </label>
      </div>
    </fieldset>
  );
}
