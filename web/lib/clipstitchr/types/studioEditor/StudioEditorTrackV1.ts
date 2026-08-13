import type { StudioEditorLayer } from "./StudioEditorLayer";
import type { StudioEditorTrackKind } from "./StudioEditorTrackKind";

export type StudioEditorTrackV1 = {
  id: string;
  name: string;
  kind: StudioEditorTrackKind;
  hidden: boolean;
  muted: boolean;
  locked: boolean;
  layers: StudioEditorLayer[];
};
