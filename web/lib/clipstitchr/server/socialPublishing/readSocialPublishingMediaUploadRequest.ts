import { createSocialPublishingMediaUploadDescriptor } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingMediaUploadDescriptor";
import { getSocialPublishingSourceType } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingSourceType";
import type { SocialPublishingMediaUploadDescriptor } from "@/lib/clipstitchr/types/SocialPublishingMediaUploadDescriptor";
import type { SocialPublishingSourceType } from "@/lib/clipstitchr/types/SocialPublishingSourceType";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type SocialPublishingMediaUploadRequestBody = {
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

export type SocialPublishingMediaUploadRequest = {
  media: SocialPublishingMediaUploadDescriptor;
  sourceId: string;
  sourceObject: R2ObjectReference;
  sourceType: SocialPublishingSourceType;
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

export async function readSocialPublishingMediaUploadRequest(
  request: Request,
): Promise<SocialPublishingMediaUploadRequest> {
  const body = (await request.json()) as SocialPublishingMediaUploadRequestBody;
  const sourceId = typeof body.sourceId === "string" ? body.sourceId.trim() : "";

  if (!sourceId) {
    throw new Error("Choose a stitch or Swipe before scheduling.");
  }

  if (typeof body.mimeType !== "string") {
    throw new Error("Zernio supports PNG, JPEG, MP4, or MOV media.");
  }

  if (typeof body.sizeBytes !== "number") {
    throw new Error("Choose media before scheduling.");
  }

  return {
    media: createSocialPublishingMediaUploadDescriptor({
      mimeType: body.mimeType,
      name: typeof body.name === "string" ? body.name : "",
      sizeBytes: body.sizeBytes,
    }),
    sourceId,
    sourceObject: readSourceObject(body.sourceObject),
    sourceType: getSocialPublishingSourceType(
      typeof body.sourceType === "string" ? body.sourceType : null,
    ),
  };
}
