export type StudioEditorUploadedMediaMetadata =
  | {
      kind: "video";
      durationSeconds: number;
      width: number;
      height: number;
      hasAudio: boolean;
    }
  | {
      kind: "image";
      width: number;
      height: number;
    }
  | {
      kind: "audio";
      durationSeconds: number;
    };
