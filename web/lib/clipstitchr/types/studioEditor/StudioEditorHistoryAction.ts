import type { StudioEditorCommand } from "./StudioEditorCommand";
import type { StudioEditorProjectV1 } from "./StudioEditorProjectV1";

export type StudioEditorHistoryAction =
  | { type: "execute"; command: StudioEditorCommand }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; project: StudioEditorProjectV1 };
