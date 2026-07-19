import type { PostBridgeMediaUploadDescriptor } from "@/lib/clipstitchr/types/PostBridgeMediaUploadDescriptor";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export type PostBridgeBatchPreparedMedia = {
  media: PostBridgeMediaUploadDescriptor;
  sourceObject: R2ObjectReference;
};
