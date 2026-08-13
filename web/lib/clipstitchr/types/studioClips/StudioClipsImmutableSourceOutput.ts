export type StudioClipsImmutableSourceOutput = {
  audioCodec?: string;
  captionCues?: import("./StudioClipsCaptionCue").StudioClipsCaptionCue[];
  captionsBurned?: boolean;
  contentType: string;
  cleanMaster?: {
    contentType: string;
    objectKey: string;
    sha256: string;
    sizeBytes: number;
  };
  durationSeconds: number;
  fileName: string;
  hasAudio: boolean;
  height: number;
  id: string;
  objectKey: string;
  revision: number;
  sha256: string;
  sizeBytes: number;
  taskId: string;
  videoCodec: string;
  width: number;
};
