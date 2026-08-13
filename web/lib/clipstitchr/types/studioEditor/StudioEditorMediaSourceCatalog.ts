import type { StudioEditorMediaSourceDescriptor } from "./StudioEditorMediaSourceDescriptor";

export type StudioEditorMediaSourceCatalog = {
  videoClips: StudioEditorMediaSourceDescriptor[];
  stitches: StudioEditorMediaSourceDescriptor[];
};
