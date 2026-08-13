export type StudioEditorMediaSourceDescriptor =
  | {
      kind: "videoClip";
      id: string;
      name: string;
      durationSeconds: number;
      width: number;
      height: number;
      hasAudio: boolean;
      objectKey: string;
      posterKey?: string;
    }
  | {
      kind: "stitch";
      id: string;
      name: string;
      durationSeconds: number;
      width: number;
      height: number;
      hasAudio: boolean;
      objectKey: string;
      posterKey?: string;
    };
