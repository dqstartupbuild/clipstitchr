import { readSocialPublishingClientErrorMessage } from "@/lib/clipstitchr/client/readSocialPublishingClientErrorMessage";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import type { SocialPublishingScheduleMediaFile } from "@/lib/clipstitchr/types/SocialPublishingScheduleMediaFile";
import type { SocialPublishingSourceType } from "@/lib/clipstitchr/types/SocialPublishingSourceType";
import type { SocialPublishingUploadedMedia } from "@/lib/clipstitchr/types/SocialPublishingUploadedMedia";
import { createSocialPublishingMediaUploadBlob } from "@/lib/clipstitchr/utils/createSocialPublishingMediaUploadBlob";

type UploadSocialPublishingScheduleMediaOptions = {
  mediaFile: SocialPublishingScheduleMediaFile;
  sourceId: string;
  sourceType: SocialPublishingSourceType;
};

type SocialPublishingMediaUploadResponse = {
  media: SocialPublishingUploadedMedia;
};

export async function uploadSocialPublishingScheduleMedia({
  mediaFile,
  sourceId,
  sourceType,
}: UploadSocialPublishingScheduleMediaOptions): Promise<SocialPublishingUploadedMedia> {
  const blob = createSocialPublishingMediaUploadBlob(mediaFile);
  const [sourceObject] = await uploadBlobsToR2([
    {
      blob,
      kind: "social-publishing-media",
      recordId: `${sourceId}-${crypto.randomUUID()}`,
    },
  ]);
  const uploadResponse = await fetch("/api/social-publishing/media/upload", {
    body: JSON.stringify({
      mimeType: blob.type,
      name: mediaFile.fileName,
      sizeBytes: blob.size,
      sourceId,
      sourceObject,
      sourceType,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!uploadResponse.ok) {
    throw new Error(
      await readSocialPublishingClientErrorMessage(
        uploadResponse,
        "Unable to upload this media to Zernio.",
      ),
    );
  }

  return ((await uploadResponse.json()) as SocialPublishingMediaUploadResponse).media;
}
