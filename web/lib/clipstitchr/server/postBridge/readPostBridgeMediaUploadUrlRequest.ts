import { createPostBridgeMediaUploadDescriptor } from "@/lib/clipstitchr/server/postBridge/createPostBridgeMediaUploadDescriptor";
import { getPostBridgeSourceType } from "@/lib/clipstitchr/server/postBridge/getPostBridgeSourceType";
import type { PostBridgeMediaUploadDescriptor } from "@/lib/clipstitchr/types/PostBridgeMediaUploadDescriptor";
import type { PostBridgeSourceType } from "@/lib/clipstitchr/types/PostBridgeSourceType";

type PostBridgeMediaUploadUrlRequestBody = {
  mimeType?: unknown;
  name?: unknown;
  sizeBytes?: unknown;
  sourceId?: unknown;
  sourceType?: unknown;
};

export type PostBridgeMediaUploadUrlRequest = {
  media: PostBridgeMediaUploadDescriptor;
  sourceId: string;
  sourceType: PostBridgeSourceType;
};

export async function readPostBridgeMediaUploadUrlRequest(
  request: Request,
): Promise<PostBridgeMediaUploadUrlRequest> {
  const body = (await request.json()) as PostBridgeMediaUploadUrlRequestBody;
  const sourceId = typeof body.sourceId === "string" ? body.sourceId.trim() : "";

  if (!sourceId) {
    throw new Error("Choose a stitch or Swipe before scheduling.");
  }

  if (typeof body.mimeType !== "string") {
    throw new Error("Post Bridge supports PNG, JPEG, MP4, or MOV media.");
  }

  if (typeof body.sizeBytes !== "number") {
    throw new Error("Choose media before scheduling.");
  }

  return {
    media: createPostBridgeMediaUploadDescriptor({
      mimeType: body.mimeType,
      name: typeof body.name === "string" ? body.name : "",
      sizeBytes: body.sizeBytes,
    }),
    sourceId,
    sourceType: getPostBridgeSourceType(
      typeof body.sourceType === "string" ? body.sourceType : null,
    ),
  };
}
