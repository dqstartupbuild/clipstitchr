import { createReadStream } from "node:fs";

export async function uploadFileToSignedUrl(
  uploadUrl: string,
  filePath: string,
  contentType: string,
  contentLength: number,
) {
  const response = await fetch(uploadUrl, {
    body: createReadStream(filePath) as unknown as BodyInit,
    duplex: "half",
    headers: {
      "content-length": String(contentLength),
      "content-type": contentType,
    },
    method: "PUT",
  } as RequestInit & { duplex: "half" });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }
}
