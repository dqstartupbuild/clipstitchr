import { StudioEditorCaptionInspector } from "@/app/_components/studio/editor/StudioEditorCaptionInspector";
import { StudioEditorImageInspector } from "@/app/_components/studio/editor/StudioEditorImageInspector";
import { StudioEditorSoundLayerInspector } from "@/app/_components/studio/editor/StudioEditorSoundLayerInspector";
import { StudioEditorTextInspector } from "@/app/_components/studio/editor/StudioEditorTextInspector";
import { StudioEditorTimingInspector } from "@/app/_components/studio/editor/StudioEditorTimingInspector";
import { StudioEditorVideoInspector } from "@/app/_components/studio/editor/StudioEditorVideoInspector";
import type { StudioEditorLayerSelection } from "@/lib/clipstitchr/types/StudioEditorLayerSelection";
import type { StudioEditorLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorLayer";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorLayerInspectorProps = {
  fps: number;
  onTrim: (values: { durationSeconds: number; sourceOffsetSeconds: number; startSeconds: number }) => void;
  onUpdate: (layer: StudioEditorLayer) => void;
  selection: StudioEditorLayerSelection | null;
};

export function StudioEditorLayerInspector({
  fps,
  onTrim,
  onUpdate,
  selection,
}: StudioEditorLayerInspectorProps) {
  if (!selection) {
    return (
      <aside className={styles.inspectorPanel}>
        <div className={styles.panelHeading}>
          <div>
            <h2>Inspector</h2>
            <p>Choose a timeline layer to shape it.</p>
          </div>
        </div>
        <p className={styles.emptyInspector}>Position, crop, sound, type, captions, and transitions appear here.</p>
      </aside>
    );
  }

  const layer = selection.layer;

  return (
    <aside className={styles.inspectorPanel} aria-labelledby="inspector-title">
      <div className={styles.panelHeading}>
        <div>
          <h2 id="inspector-title">{layer.name}</h2>
          <p>{layer.kind} layer · {selection.track.name}</p>
        </div>
      </div>
      <StudioEditorTimingInspector fps={fps} layer={layer} onTrim={onTrim} />
      {layer.kind === "video" ? (
        <StudioEditorVideoInspector layer={layer} onChange={onUpdate} />
      ) : layer.kind === "image" ? (
        <StudioEditorImageInspector layer={layer} onChange={onUpdate} />
      ) : layer.kind === "text" ? (
        <StudioEditorTextInspector layer={layer} onChange={onUpdate} />
      ) : layer.kind === "caption" ? (
        <StudioEditorCaptionInspector fps={fps} layer={layer} onChange={onUpdate} />
      ) : (
        <StudioEditorSoundLayerInspector layer={layer} onChange={onUpdate} />
      )}
    </aside>
  );
}
