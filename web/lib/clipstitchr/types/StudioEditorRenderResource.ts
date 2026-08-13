import type { CanvasSink, Input } from "mediabunny";
import type { StudioEditorResolvedSource } from "./StudioEditorResolvedSource";

export type StudioEditorRenderResource = {
  source: StudioEditorResolvedSource;
  blob: Blob;
  input?: Input;
  videoSink?: CanvasSink;
  videoFirstTimestamp?: number;
  image?: ImageBitmap;
};
