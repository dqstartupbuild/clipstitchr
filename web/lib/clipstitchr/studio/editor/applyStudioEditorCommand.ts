import type { StudioEditorCommand } from "../../types/studioEditor/StudioEditorCommand";
import type { StudioEditorProjectV1 } from "../../types/studioEditor/StudioEditorProjectV1";
import { applyStudioEditorAddLayer } from "./applyStudioEditorAddLayer";
import { applyStudioEditorRemoveLayer } from "./applyStudioEditorRemoveLayer";
import { applyStudioEditorReorderLayer } from "./applyStudioEditorReorderLayer";
import { applyStudioEditorSplitLayer } from "./applyStudioEditorSplitLayer";
import { applyStudioEditorTrimLayer } from "./applyStudioEditorTrimLayer";
import { applyStudioEditorUpdateLayer } from "./applyStudioEditorUpdateLayer";
import { assertStudioEditorProjectV1 } from "./assertStudioEditorProjectV1";

export function applyStudioEditorCommand(
  project: StudioEditorProjectV1,
  command: StudioEditorCommand,
): StudioEditorProjectV1 {
  assertStudioEditorProjectV1(project);
  let result: StudioEditorProjectV1;
  switch (command.type) {
    case "addLayer":
      result = applyStudioEditorAddLayer(project, command);
      break;
    case "updateLayer":
      result = applyStudioEditorUpdateLayer(project, command);
      break;
    case "removeLayer":
      result = applyStudioEditorRemoveLayer(project, command);
      break;
    case "reorderLayer":
      result = applyStudioEditorReorderLayer(project, command);
      break;
    case "trimLayer":
      result = applyStudioEditorTrimLayer(project, command);
      break;
    case "splitLayer":
      result = applyStudioEditorSplitLayer(project, command);
      break;
  }
  assertStudioEditorProjectV1(result);
  return result;
}
