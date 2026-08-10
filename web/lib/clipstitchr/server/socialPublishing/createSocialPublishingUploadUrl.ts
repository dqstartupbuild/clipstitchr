import { requestSocialPublishing } from "@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing";

type CreateSocialPublishingUploadUrlOptions = {
  apiKey: string;
  mimeType: string;
  name: string;
  sizeBytes: number;
};

type CreateSocialPublishingUploadUrlResponse = {
  expiresIn: number;
  key: string;
  publicUrl: string;
  uploadUrl: string;
};

export async function createSocialPublishingUploadUrl({
  apiKey,
  mimeType,
  name,
  sizeBytes,
}: CreateSocialPublishingUploadUrlOptions) {
  return await requestSocialPublishing<CreateSocialPublishingUploadUrlResponse>(
    "/v1/media/presign",
    {
      apiKey,
      body: {
        contentType: mimeType,
        filename: name,
        size: sizeBytes,
      },
      method: "POST",
    },
  );
}
