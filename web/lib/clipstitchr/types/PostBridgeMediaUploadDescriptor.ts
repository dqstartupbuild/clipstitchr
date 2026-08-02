import type { PostBridgeMediaKind } from "@/lib/clipstitchr/types/PostBridgeMediaKind";

export type PostBridgeMediaUploadDescriptor = {
  mediaKind: PostBridgeMediaKind;
  mimeType: string;
  name: string;
  sizeBytes: number;
};
