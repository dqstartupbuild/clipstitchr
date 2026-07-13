export type LocalVideoInspection = {
  fileName: string;
  fileSize: number;
  duration: number;
  width: number;
  height: number;
  aspectRatio: number;
  rotation: number;
  mimeType: string;
  hasAudio: boolean;
  videoCanDecode: boolean;
  audioCanDecode: boolean;
  videoCodec: string | null;
  videoCodecParameter: string | null;
  videoFrameRate: number | null;
  videoBitrate: number | null;
  hasHighDynamicRange: boolean | null;
  pixelAspectRatio: {
    num: number;
    den: number;
  } | null;
  audioCodec: string | null;
  audioCodecParameter: string | null;
  audioBitrate: number | null;
  audioChannels: number | null;
  audioSampleRate: number | null;
  videoTrackCount: number;
  audioTrackCount: number;
};
