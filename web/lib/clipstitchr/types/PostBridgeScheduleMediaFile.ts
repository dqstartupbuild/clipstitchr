import type { PostBridgeMediaKind } from "@/lib/clipstitchr/types/PostBridgeMediaKind";

export type PostBridgeScheduleMediaFile = {
  blob: Blob;
  durationSeconds?: number;
  fileName: string;
  height?: number;
  mediaKind: PostBridgeMediaKind;
  width?: number;
};
