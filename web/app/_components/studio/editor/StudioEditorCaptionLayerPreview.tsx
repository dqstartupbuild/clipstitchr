import { CSSProperties } from "react";
import { getStudioEditorActiveCaptionText } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorActiveCaptionText";
import type { StudioEditorCanvasV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorCanvasV1";
import type { StudioEditorCaptionLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorCaptionLayer";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorCaptionLayerPreviewProps = {
  canvas: StudioEditorCanvasV1;
  layer: StudioEditorCaptionLayer;
  timelineSeconds: number;
};

export function StudioEditorCaptionLayerPreview({
  canvas,
  layer,
  timelineSeconds,
}: StudioEditorCaptionLayerPreviewProps) {
  const text = getStudioEditorActiveCaptionText(layer, timelineSeconds);
  if (!text) return null;

  const style: CSSProperties = {
    backgroundColor: layer.style.text.backgroundColor,
    color: layer.style.text.color,
    fontFamily: layer.style.text.fontFamily,
    fontSize: `${(layer.style.text.fontSizePixels / canvas.width) * 100}cqw`,
    fontWeight: layer.style.text.fontWeight,
    letterSpacing: `${(layer.style.text.letterSpacingPixels / canvas.width) * 100}cqw`,
    lineHeight: layer.style.text.lineHeight,
    maxWidth: `${layer.style.maxWidthRatio * 100}%`,
    textAlign: layer.style.text.textAlign,
    top: `${layer.style.positionYRatio * 100}%`,
    WebkitTextStroke: `${(layer.style.text.outlineWidthPixels / canvas.width) * 100}cqw ${layer.style.text.outlineColor}`,
  };

  return (
    <div className={styles.previewCaptionLayer} style={style}>
      {text}
    </div>
  );
}
