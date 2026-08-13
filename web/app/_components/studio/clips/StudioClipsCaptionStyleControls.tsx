import { updateStudioClipsCaptionCustomFont } from "./updateStudioClipsCaptionCustomFont";
import type { StudioClipsCapabilities } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsCapabilities";
import type { StudioClipsStyleDraft } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsStyleDraft";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsCaptionStyleControlsProps = {
  capabilities: StudioClipsCapabilities;
  disabled: boolean;
  onChange: (style: StudioClipsStyleDraft) => void;
  style: StudioClipsStyleDraft;
};

export function StudioClipsCaptionStyleControls({
  capabilities,
  disabled,
  onChange,
  style,
}: StudioClipsCaptionStyleControlsProps) {
  return (
    <details className={styles.captionDetails}>
      <summary>Caption look</summary>
      <fieldset disabled={disabled}>
        <p className={styles.intentNote}>
          {capabilities.captionStyle.execution === "rendered"
            ? "These choices are applied when captions are burned into the finished clips."
            : "These choices are saved with the task. The current processor does not apply the caption look to a render yet."}
        </p>
        <label className={styles.field}>
          <span>Caption template</span>
          <select
            value={style.captionTemplate}
            onChange={(event) => {
              const template = capabilities.captionStyle.templates.find(
                (candidate) => candidate.id === event.target.value,
              );
              onChange({
                ...style,
                captionTemplate: event.target.value,
                ...(template
                  ? {
                      fontColor: template.fontColorHex,
                      fontFamily: template.fontFamily,
                      fontSizePx: template.fontSizePx,
                    }
                  : {}),
              });
            }}
          >
            {capabilities.captionStyle.templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.description}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.styleGrid}>
          <label className={styles.field}>
            <span>Built-in font</span>
            <select
              value={style.fontFamily}
              onChange={(event) => onChange({ ...style, fontFamily: event.target.value })}
            >
              {capabilities.captionStyle.builtInFonts.map((font) => <option key={font.id} value={font.id}>{font.displayName}</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span>Font size</span>
            <input
              inputMode="numeric"
              max={200}
              min={8}
              step={1}
              type="number"
              value={style.fontSizePx}
              onChange={(event) => onChange({ ...style, fontSizePx: Number(event.target.value) })}
            />
            <small>
              Suggested sizes: {capabilities.captionStyle.fontSizeOptionsPx.join(", ")} px.
            </small>
          </label>
          <label className={styles.colorField}>
            <span>Font color</span>
            <input
              aria-label="Caption font color picker"
              type="color"
              value={style.fontColor.slice(0, 7)}
              onChange={(event) => onChange({ ...style, fontColor: event.target.value.toUpperCase() })}
            />
            <input
              aria-label="Caption font color hex value"
              maxLength={9}
              pattern="#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?"
              value={style.fontColor}
              onChange={(event) => onChange({ ...style, fontColor: event.target.value.toUpperCase() })}
            />
          </label>
        </div>
        <label className={styles.uploadField}>
          <span>Custom font</span>
          <input
            accept=".ttf,.otf"
            disabled={
              capabilities.captionStyle.customFontUpload.state === "unavailable"
            }
            type="file"
            onChange={(event) =>
              updateStudioClipsCaptionCustomFont(event, style, onChange)
            }
          />
          <small role="status">
            {capabilities.captionStyle.customFontUpload.message}
          </small>
        </label>
      </fieldset>
    </details>
  );
}
