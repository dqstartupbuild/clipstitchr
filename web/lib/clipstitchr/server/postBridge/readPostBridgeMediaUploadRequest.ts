import { createPostBridgeMediaUploadDescriptor } from "@/lib/clipstitchr/server/postBridge/createPostBridgeMediaUploadDescriptor";
import { getPostBridgeSourceType } from "@/lib/clipstitchr/server/postBridge/getPostBridgeSourceType";
import type { PostBridgeMediaUploadDescriptor } from "@/lib/clipstitchr/types/PostBridgeMediaUploadDescriptor";
import type { PostBridgeSourceType } from "@/lib/clipstitchr/types/PostBridgeSourceType";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type PostBridgeMediaUploadRequestBody = {
  mimeType?: unknown;
  name?: unknown;
  sizeBytes?: unknown;
  sourceId?: unknown;
  sourceObject?: unknown;
  sourceType?: unknown;
};

type SourceObjectBody = {
  contentType?: unknown;
  key?: unknown;
  size?: unknown;
};

export type PostBridgeMediaUploadRequest = {
  media: PostBridgeMediaUploadDescriptor;
  sourceId: string;
  sourceObject: R2ObjectReference;
  sourceType: PostBridgeSourceType;
};

function readSourceObject(value: unknown): R2ObjectReference {
  const sourceObject = value as SourceObjectBody | null;

  if (
    !sourceObject ||
    typeof sourceObject.key !== "string" ||
    typeof sourceObject.contentType !== "string" ||
    typeof sourceObject.size !== "number" ||
    !Number.isFinite(sourceObject.size) ||
    sourceObject.size <= 0
  ) {
    throw new Error("Unable to load the rendered media upload.");
  }

  return {
    contentType: sourceObject.contentType,
    key: sourceObject.key,
    size: Math.ceil(sourceObject.size),
  };
}

export async function readPostBridgeMediaUploadRequest(
  request: Request,
): Promise<PostBridgeMediaUploadRequest> {
  const body = (await request.json()) as PostBridgeMediaUploadRequestBody;
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
    sourceObject: readSourceObject(body.sourceObject),
    sourceType: getPostBridgeSourceType(
      typeof body.sourceType === "string" ? body.sourceType : null,
    ),
  };
}
