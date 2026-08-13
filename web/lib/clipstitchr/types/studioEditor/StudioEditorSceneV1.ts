import type { StudioEditorTrackV1 } from "./StudioEditorTrackV1";

export type StudioEditorSceneV1 = {
  id: string;
  name: string;
  isMain: boolean;
  tracks: StudioEditorTrackV1[];
};
