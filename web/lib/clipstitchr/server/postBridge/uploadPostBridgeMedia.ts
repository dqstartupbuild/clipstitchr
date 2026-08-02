import { createPostBridgeUploadUrl } from "@/lib/clipstitchr/server/postBridge/createPostBridgeUploadUrl";
import { normalizePostBridgeMediaMimeType } from "@/lib/clipstitchr/server/postBridge/normalizePostBridgeMediaMimeType";

type UploadPostBridgeMediaOptions = {
  apiKey: string;
  file: File;
  name: string;
};

export async function uploadPostBridgeMedia({
  apiKey,
  file,
  name,
}: UploadPostBridgeMediaOptions) {
  const mimeType = normalizePostBridgeMediaMimeType(file.type);
  const upload = await createPostBridgeUploadUrl({
    apiKey,
    mimeType,
    name,
    sizeBytes: file.size,
  });
  const response = await fetch(upload.upload_url, {
    body: await file.arrayBuffer(),
    headers: {
      "Content-Type": mimeType,
    },
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error(
      `Post Bridge media upload failed with status ${response.status}.`,
    );
  }

  return upload.media_id;
}
