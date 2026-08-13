import type { StudioEditorAddLayerCommand } from "./StudioEditorAddLayerCommand";
import type { StudioEditorRemoveLayerCommand } from "./StudioEditorRemoveLayerCommand";
import type { StudioEditorReorderLayerCommand } from "./StudioEditorReorderLayerCommand";
import type { StudioEditorSplitLayerCommand } from "./StudioEditorSplitLayerCommand";
import type { StudioEditorTrimLayerCommand } from "./StudioEditorTrimLayerCommand";
import type { StudioEditorUpdateLayerCommand } from "./StudioEditorUpdateLayerCommand";

export type StudioEditorCommand =
  | StudioEditorAddLayerCommand
  | StudioEditorUpdateLayerCommand
  | StudioEditorRemoveLayerCommand
  | StudioEditorReorderLayerCommand
  | StudioEditorTrimLayerCommand
  | StudioEditorSplitLayerCommand;
