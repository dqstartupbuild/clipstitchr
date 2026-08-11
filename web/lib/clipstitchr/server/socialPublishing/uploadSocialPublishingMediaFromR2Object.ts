import { createSocialPublishingUploadedMedia } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingUploadedMedia";
import { createSocialPublishingUploadUrl } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingUploadUrl";
import { normalizeSocialPublishingMediaMimeType } from "@/lib/clipstitchr/server/socialPublishing/normalizeSocialPublishingMediaMimeType";
import { waitForSocialPublishingMediaAvailability } from "@/lib/clipstitchr/server/socialPublishing/waitForSocialPublishingMediaAvailability";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { deleteR2Object } from "@/lib/clipstitchr/server/r2/deleteR2Object";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import type { SocialPublishingMediaUploadDescriptor } from "@/lib/clipstitchr/types/SocialPublishingMediaUploadDescriptor";
import type { SocialPublishingUploadedMedia } from "@/lib/clipstitchr/types/SocialPublishingUploadedMedia";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type UploadSocialPublishingMediaFromR2ObjectOptions = {
  apiKey: string;
  deleteSourceObject?: boolean;
  media: SocialPublishingMediaUploadDescriptor;
  sourceObject: R2ObjectReference;
  userId: string;
};

type StreamingRequestInit = RequestInit & {
  duplex: "half";
};

export async function uploadSocialPublishingMediaFromR2Object({
  apiKey,
  deleteSourceObject: shouldDeleteSourceObject = true,
  media,
  sourceObject,
  userId,
}: UploadSocialPublishingMediaFromR2ObjectOptions): Promise<SocialPublishingUploadedMedia> {
  assertR2ObjectKeyBelongsToUser(sourceObject.key, userId);

  if (
    normalizeSocialPublishingMediaMimeType(sourceObject.contentType) !== media.mimeType ||
    sourceObject.size !== media.sizeBytes
  ) {
    throw new Error("Unable to load the rendered media upload.");
  }

  try {
    const [{ url: downloadUrl }, upload] = await Promise.all([
      getR2DownloadSignedUrl(sourceObject.key),
      createSocialPublishingUploadUrl({
        apiKey,
        mimeType: media.mimeType,
        name: media.name,
        sizeBytes: media.sizeBytes,
      }),
    ]);
    let sourceResponse: Response;

    try {
      sourceResponse = await fetch(downloadUrl, {
        signal: AbortSignal.timeout(45_000),
      });
    } catch {
      throw new Error("Unable to load the rendered media upload. Try again.");
    }

    if (!sourceResponse.ok || !sourceResponse.body) {
      throw new Error("Unable to load the rendered media upload.");
    }

    let uploadResponse: Response;

    try {
      uploadResponse = await fetch(upload.uploadUrl, {
        body: sourceResponse.body,
        duplex: "half",
        headers: {
          "Content-Length": String(media.sizeBytes),
          "Content-Type": media.mimeType,
        },
        method: "PUT",
        signal: AbortSignal.timeout(45_000),
      } as StreamingRequestInit);
    } catch {
      throw new Error(
        "Zernio took too long to receive this media. Try posting again.",
      );
    }

    if (!uploadResponse.ok) {
      throw new Error(
        `Zernio media upload failed with status ${uploadResponse.status}.`,
      );
    }

    await waitForSocialPublishingMediaAvailability(upload.publicUrl);

    return createSocialPublishingUploadedMedia({
      mediaId: upload.publicUrl,
      mimeType: media.mimeType,
      name: media.name,
      sizeBytes: media.sizeBytes,
    });
  } finally {
    if (shouldDeleteSourceObject) {
      await deleteR2Object(sourceObject.key).catch(() => undefined);
    }
  }
}
