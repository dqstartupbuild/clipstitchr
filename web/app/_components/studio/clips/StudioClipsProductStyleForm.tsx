"use client";

import { useState } from "react";
import type { StudioClipsCapabilities } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsCapabilities";
import type { StudioClipsCaptionStyle } from "@/lib/clipstitchr/types/studioClips/StudioClipsCaptionStyle";
import { useSaveStudioClipsProductStyle } from "@/lib/clipstitchr/hooks/studioClips/useSaveStudioClipsProductStyle";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";
import { saveStudioClipsProductStyle } from "./saveStudioClipsProductStyle";

type StudioClipsProductStyleFormProps = {
  capabilities: StudioClipsCapabilities;
  disabled: boolean;
  onUpdated: () => void;
  processingAvailable: boolean;
  productId: string;
};

export function StudioClipsProductStyleForm({
  capabilities,
  disabled,
  onUpdated,
  processingAvailable,
  productId,
}: StudioClipsProductStyleFormProps) {
  const firstTemplate = capabilities.captionStyle.templates[0];
  const [style, setStyle] = useState<StudioClipsCaptionStyle>({
    fontColorHex: firstTemplate?.fontColorHex ?? "#FFFFFF",
    fontFamily:
      firstTemplate?.fontFamily ??
      capabilities.captionStyle.builtInFonts[0]?.id,
    fontSizePx:
      firstTemplate?.fontSizePx ??
      capabilities.captionStyle.fontSizeOptionsPx[0],
    templateId: firstTemplate?.id ?? "default",
  });
  const save = useSaveStudioClipsProductStyle(productId);
  const controlsDisabled = disabled || save.isSaving;
  const availabilityId = "studio-clips-product-style-availability";

  return (
    <details className={styles.productStyle}>
      <summary>Product caption style</summary>
      <form onSubmit={(event) => void saveStudioClipsProductStyle(event, style, save.saveStyle, onUpdated)}>
        <p className={styles.intentNote} id={availabilityId}>
          {processingAvailable
            ? "This becomes the default for future clips. If this Product already has finished clips, saving starts one batch render to update them."
            : "This saves the default for future clips. Existing clips cannot be updated until processing is available."}
        </p>
        <div className={styles.productStyleFields}>
          <label className={styles.field}>
            Template
            <select
              disabled={controlsDisabled}
              onChange={(event) => {
                const template = capabilities.captionStyle.templates.find(
                  (item) => item.id === event.target.value,
                );
                setStyle({
                  ...style,
                  templateId: event.target.value,
                  ...(template
                    ? {
                        fontColorHex: template.fontColorHex,
                        fontFamily: template.fontFamily,
                        fontSizePx: template.fontSizePx,
                      }
                    : {}),
                });
              }}
              value={style.templateId}
            >
              {capabilities.captionStyle.templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            Font
            <select
              disabled={controlsDisabled}
              onChange={(event) =>
                setStyle({ ...style, fontFamily: event.target.value })
              }
              value={style.fontFamily}
            >
              {capabilities.captionStyle.builtInFonts.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.displayName}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            Size
            <select
              disabled={controlsDisabled}
              onChange={(event) =>
                setStyle({ ...style, fontSizePx: Number(event.target.value) })
              }
              value={style.fontSizePx}
            >
              {capabilities.captionStyle.fontSizeOptionsPx.map((size) => (
                <option key={size} value={size}>
                  {size} px
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            Color
            <input
              disabled={controlsDisabled}
              onChange={(event) =>
                setStyle({
                  ...style,
                  fontColorHex: event.target.value.toUpperCase(),
                })
              }
              type="color"
              value={(style.fontColorHex ?? "#FFFFFF").slice(0, 7)}
            />
          </label>
        </div>
        <button
          aria-describedby={availabilityId}
          disabled={controlsDisabled}
          type="submit"
        >
          {save.isSaving ? "Saving Product style..." : "Save Product style"}
        </button>
        {disabled ? (
          <p className={styles.inlineStatus} role="status">
            Finish the active clip job before changing the Product style.
          </p>
        ) : null}
        {save.statusMessage ? (
          <p className={styles.inlineStatus} role="status">
            {save.statusMessage}
          </p>
        ) : null}
        {save.error ? (
          <p className={styles.inlineError} role="alert">
            {save.error}
          </p>
        ) : null}
      </form>
    </details>
  );
}
