import { StudioEditorSaveIndicator } from "@/app/_components/studio/editor/StudioEditorSaveIndicator";
import type { StudioEditorSaveStatus } from "@/lib/clipstitchr/types/StudioEditorSaveStatus";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorToolbarProps = {
  canMoveLater: boolean;
  canMoveEarlier: boolean;
  canSplit: boolean;
  canRedo: boolean;
  canUndo: boolean;
  hasSelection: boolean;
  onAddCaption: () => void;
  onAddText: () => void;
  onBack: () => void;
  onDelete: () => void;
  onMoveEarlier: () => void;
  onMoveLater: () => void;
  onRedo: () => void;
  onSplit: () => void;
  onUndo: () => void;
  projectName: string;
  saveError: string | null;
  saveStatus: StudioEditorSaveStatus;
};

export function StudioEditorToolbar({
  canMoveEarlier,
  canMoveLater,
  canSplit,
  canRedo,
  canUndo,
  hasSelection,
  onAddCaption,
  onAddText,
  onBack,
  onDelete,
  onMoveEarlier,
  onMoveLater,
  onRedo,
  onSplit,
  onUndo,
  projectName,
  saveError,
  saveStatus,
}: StudioEditorToolbarProps) {
  return (
    <header className={styles.editorToolbar}>
      <div className={styles.toolbarProject}>
        <button className={styles.quietButton} type="button" onClick={onBack}>
          Back to edits
        </button>
        <div>
          <h2>{projectName}</h2>
          <StudioEditorSaveIndicator error={saveError} status={saveStatus} />
        </div>
      </div>
      <div className={styles.toolbarActions} aria-label="Edit actions">
        <button disabled={!canUndo} type="button" onClick={onUndo}>Undo</button>
        <button disabled={!canRedo} type="button" onClick={onRedo}>Redo</button>
        <button type="button" onClick={onAddText}>Add text</button>
        <button type="button" onClick={onAddCaption}>Add captions</button>
        <button disabled={!canSplit} type="button" onClick={onSplit}>Split</button>
        <button disabled={!canMoveEarlier} type="button" onClick={onMoveEarlier}>Move earlier</button>
        <button disabled={!canMoveLater} type="button" onClick={onMoveLater}>Move later</button>
        <button disabled={!hasSelection} type="button" onClick={onDelete}>Remove</button>
      </div>
    </header>
  );
}
