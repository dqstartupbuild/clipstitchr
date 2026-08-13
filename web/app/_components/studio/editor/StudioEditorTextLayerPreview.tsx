import { CSSProperties } from "react";
import { getStudioEditorTransitionProgress } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorTransitionProgress";
import type { StudioEditorCanvasV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorCanvasV1";
import type { StudioEditorTextLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorTextLayer";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorTextLayerPreviewProps = {
  canvas: StudioEditorCanvasV1;
  layer: StudioEditorTextLayer;
  timelineSeconds: number;
};

export function StudioEditorTextLayerPreview({
  canvas,
  layer,
  timelineSeconds,
}: StudioEditorTextLayerPreviewProps) {
  const style: CSSProperties = {
    backgroundColor: layer.style.backgroundColor,
    color: layer.style.color,
    fontFamily: layer.style.fontFamily,
    fontSize: `${(layer.style.fontSizePixels / canvas.width) * 100}cqw`,
    fontWeight: layer.style.fontWeight,
    letterSpacing: `${(layer.style.letterSpacingPixels / canvas.width) * 100}cqw`,
    lineHeight: layer.style.lineHeight,
    opacity:
      layer.transform.opacity *
      getStudioEditorTransitionProgress(layer, timelineSeconds),
    textAlign: layer.style.textAlign,
    transform: `translate(-50%, -50%) translate(${(layer.transform.positionX / canvas.width) * 100}cqw, ${(layer.transform.positionY / canvas.width) * 100}cqw) rotate(${layer.transform.rotationDegrees}deg) scale(${layer.transform.scaleX}, ${layer.transform.scaleY})`,
    WebkitTextStroke: `${(layer.style.outlineWidthPixels / canvas.width) * 100}cqw ${layer.style.outlineColor}`,
  };

  return (
    <div className={styles.previewTextLayer} style={style}>
      {layer.text}
    </div>
  );
}
