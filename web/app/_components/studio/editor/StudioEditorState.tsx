import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorStateProps = {
  actionLabel?: string;
  message: string;
  onAction?: () => void;
  title: string;
};

export function StudioEditorState({
  actionLabel,
  message,
  onAction,
  title,
}: StudioEditorStateProps) {
  return (
    <section className={styles.editorState} role="status">
      <h2>{title}</h2>
      <p>{message}</p>
      {actionLabel && onAction ? (
        <button onClick={onAction} type="button">
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
