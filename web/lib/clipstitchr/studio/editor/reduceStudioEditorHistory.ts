import type { StudioEditorHistoryAction } from "../../types/studioEditor/StudioEditorHistoryAction";
import type { StudioEditorHistoryState } from "../../types/studioEditor/StudioEditorHistoryState";
import { applyStudioEditorCommand } from "./applyStudioEditorCommand";
import { assertStudioEditorProjectV1 } from "./assertStudioEditorProjectV1";

export function reduceStudioEditorHistory(
  state: StudioEditorHistoryState,
  action: StudioEditorHistoryAction,
): StudioEditorHistoryState {
  switch (action.type) {
    case "execute": {
      const present = applyStudioEditorCommand(state.present, action.command);
      return {
        ...state,
        past: [...state.past, state.present].slice(-state.limit),
        present,
        future: [],
      };
    }
    case "undo": {
      const present = state.past.at(-1);
      if (!present) return state;
      return {
        ...state,
        past: state.past.slice(0, -1),
        present,
        future: [state.present, ...state.future].slice(0, state.limit),
      };
    }
    case "redo": {
      const present = state.future[0];
      if (!present) return state;
      return {
        ...state,
        past: [...state.past, state.present].slice(-state.limit),
        present,
        future: state.future.slice(1),
      };
    }
    case "reset":
      assertStudioEditorProjectV1(action.project);
      return { ...state, past: [], present: action.project, future: [] };
  }
}
