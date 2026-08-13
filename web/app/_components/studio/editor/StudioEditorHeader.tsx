import { StudioBetaWorkspaceNavigation } from "@/app/_components/studio/StudioBetaWorkspaceNavigation";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorHeaderProps = {
  productName: string;
};

export function StudioEditorHeader({ productName }: StudioEditorHeaderProps) {
  return (
    <header className={styles.editorHeader}>
      <div>
        <p className={styles.productName}>{productName}</p>
        <h1>Edit with the whole story in view.</h1>
      </div>
      <p className={styles.headerNote}>
        Layer source clips, captions, voice, and music. Every cut stays tied to
        this Product and saves while you work.
      </p>
      <StudioBetaWorkspaceNavigation current="edit" />
    </header>
  );
}
