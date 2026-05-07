export type CreatedVideo = {
  id: string;
  name: string;
  ugcClipId: string;
  demoClipId: string;
  ugcClipName: string;
  demoClipName: string;
  blob: Blob;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  duration: number;
  createdAt: string;
};
