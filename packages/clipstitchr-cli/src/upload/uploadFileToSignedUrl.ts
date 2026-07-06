import { createReadStream } from "node:fs";

export async function uploadFileToSignedUrl(
  uploadUrl: string,
  filePath: string,
  contentType: string,
) {
  const response = await fetch(uploadUrl, {
    body: createReadStream(filePath) as unknown as BodyInit,
    duplex: "half",
    headers: {
      "content-type": contentType,
    },
    method: "PUT",
  } as RequestInit & { duplex: "half" });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }
}
