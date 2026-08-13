import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

export function StudioEditorShortcutHelp() {
  return (
    <details className={styles.shortcutHelp}>
      <summary>Keyboard shortcuts</summary>
      <dl>
        <div><dt>Play / pause</dt><dd>Space</dd></div>
        <div><dt>Split selected layer</dt><dd>S</dd></div>
        <div><dt>Remove selected layer</dt><dd>Delete</dd></div>
        <div><dt>Undo</dt><dd>⌘ / Ctrl + Z</dd></div>
        <div><dt>Redo</dt><dd>⌘ / Ctrl + Shift + Z</dd></div>
      </dl>
    </details>
  );
}
