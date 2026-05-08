export type ClipMetadata = {
  duration: number;
  width: number;
  height: number;
  aspectRatio: number;
  rotation: number;
  hasAudio: boolean;
  videoCanDecode: boolean;
  audioCanDecode: boolean;
  mimeType: string;
};
