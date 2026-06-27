import { createPostBridgeUploadUrl } from "@/lib/clipstitchr/server/postBridge/createPostBridgeUploadUrl";

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
  const upload = await createPostBridgeUploadUrl({
    apiKey,
    mimeType: file.type,
    name,
    sizeBytes: file.size,
  });
  const response = await fetch(upload.upload_url, {
    body: await file.arrayBuffer(),
    headers: {
      "Content-Type": file.type,
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
