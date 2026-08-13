"use client";

import { useEffect } from "react";

type UseStudioEditorKeyboardShortcutsOptions = {
  onDelete: () => void;
  onRedo: () => void;
  onSplit: () => void;
  onTogglePlayback: () => void;
  onUndo: () => void;
};

export function useStudioEditorKeyboardShortcuts({
  onDelete,
  onRedo,
  onSplit,
  onTogglePlayback,
  onUndo,
}: UseStudioEditorKeyboardShortcutsOptions) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (isEditing) return;

      const commandKey = event.metaKey || event.ctrlKey;

      if (commandKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) onRedo();
        else onUndo();
        return;
      }

      if (event.key === " ") {
        event.preventDefault();
        onTogglePlayback();
      } else if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        onSplit();
      } else if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        onDelete();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onDelete, onRedo, onSplit, onTogglePlayback, onUndo]);
}
