import type { PostBridgeMediaKind } from "@/lib/clipstitchr/types/PostBridgeMediaKind";

export type PostBridgeScheduleMediaFile = {
  blob: Blob;
  fileName: string;
  mediaKind: PostBridgeMediaKind;
};
