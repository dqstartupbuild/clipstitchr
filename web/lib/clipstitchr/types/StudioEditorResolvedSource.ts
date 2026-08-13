import type { StudioEditorSourceRef } from "./studioEditor/StudioEditorSourceRef";

export type StudioEditorResolvedSource = {
  identity: string;
  source: StudioEditorSourceRef;
  objectKey: string;
  name: string;
  contentType?: string;
};
