"use client";

import { useCallback, useReducer } from "react";
import { createStudioEditorHistoryState } from "@/lib/clipstitchr/studio/editor/createStudioEditorHistoryState";
import { reduceStudioEditorHistory } from "@/lib/clipstitchr/studio/editor/reduceStudioEditorHistory";
import type { StudioEditorCommand } from "@/lib/clipstitchr/types/studioEditor/StudioEditorCommand";
import type { StudioEditorProjectV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectV1";

export function useStudioEditorHistory(initialProject: StudioEditorProjectV1) {
  const [state, dispatch] = useReducer(
    reduceStudioEditorHistory,
    initialProject,
    (project) => createStudioEditorHistoryState(project, 100),
  );
  const execute = useCallback(
    (command: StudioEditorCommand) => dispatch({ type: "execute", command }),
    [],
  );
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);

  return {
    canRedo: state.future.length > 0,
    canUndo: state.past.length > 0,
    execute,
    project: state.present,
    redo,
    undo,
  };
}
