import { requestPostBridge } from "@/lib/clipstitchr/server/postBridge/requestPostBridge";

type CreatePostBridgeUploadUrlOptions = {
  apiKey: string;
  mimeType: string;
  name: string;
  sizeBytes: number;
};

type CreatePostBridgeUploadUrlResponse = {
  media_id: string;
  name: string;
  upload_url: string;
};

export async function createPostBridgeUploadUrl({
  apiKey,
  mimeType,
  name,
  sizeBytes,
}: CreatePostBridgeUploadUrlOptions) {
  return await requestPostBridge<CreatePostBridgeUploadUrlResponse>(
    "/v1/media/create-upload-url",
    {
      apiKey,
      body: {
        mime_type: mimeType,
        name,
        size_bytes: sizeBytes,
      },
      method: "POST",
    },
  );
}
