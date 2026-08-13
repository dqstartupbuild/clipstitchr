import type { StudioEditorCanvasV1 } from "./StudioEditorCanvasV1";
import type { StudioEditorProjectVersion } from "./StudioEditorProjectVersion";
import type { StudioEditorSceneV1 } from "./StudioEditorSceneV1";

export type StudioEditorProjectV1 = {
  version: StudioEditorProjectVersion;
  id: string;
  productId: string;
  name: string;
  canvas: StudioEditorCanvasV1;
  scenes: StudioEditorSceneV1[];
  activeSceneId: string;
};
