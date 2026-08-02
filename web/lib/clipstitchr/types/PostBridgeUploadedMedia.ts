import type { PostBridgeMediaUploadDescriptor } from "@/lib/clipstitchr/types/PostBridgeMediaUploadDescriptor";

export type PostBridgeUploadedMedia = PostBridgeMediaUploadDescriptor & {
  mediaId: string;
};
