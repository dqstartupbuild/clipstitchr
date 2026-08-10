import { createSocialPublishingUploadUrl } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingUploadUrl";
import { normalizeSocialPublishingMediaMimeType } from "@/lib/clipstitchr/server/socialPublishing/normalizeSocialPublishingMediaMimeType";

type UploadSocialPublishingMediaOptions = {
  apiKey: string;
  file: File;
  name: string;
};

export async function uploadSocialPublishingMedia({
  apiKey,
  file,
  name,
}: UploadSocialPublishingMediaOptions) {
  const mimeType = normalizeSocialPublishingMediaMimeType(file.type);
  const upload = await createSocialPublishingUploadUrl({
    apiKey,
    mimeType,
    name,
    sizeBytes: file.size,
  });
  const response = await fetch(upload.uploadUrl, {
    body: await file.arrayBuffer(),
    headers: {
      "Content-Type": mimeType,
    },
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error(
      `Zernio media upload failed with status ${response.status}.`,
    );
  }

  return upload.publicUrl;
}
