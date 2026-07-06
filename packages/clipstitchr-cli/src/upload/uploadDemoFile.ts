import { stat } from "node:fs/promises";
import { basename } from "node:path";
import { completeDemoUpload } from "../api/completeDemoUpload.js";
import { createDemoUpload } from "../api/createDemoUpload.js";
import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import { getVideoContentType } from "./getVideoContentType.js";
import { uploadFileToSignedUrl } from "./uploadFileToSignedUrl.js";
import { waitForUploadCompletion } from "./waitForUploadCompletion.js";

export async function uploadDemoFile(
  credentials: ClipstitchrCredentials,
  input: {
    filePath: string;
    productId: string;
    wait: boolean;
  },
) {
  const fileStats = await stat(input.filePath);
  const contentType = getVideoContentType(input.filePath);
  const upload = await createDemoUpload(credentials, {
    contentType,
    productId: input.productId,
    sizeBytes: fileStats.size,
  });

  await uploadFileToSignedUrl(
    upload.uploadUrl,
    input.filePath,
    contentType,
    fileStats.size,
  );
  await completeDemoUpload(credentials, {
    clipId: upload.clipId,
    contentType,
    key: upload.sourceVideoObject.key,
    originalName: basename(input.filePath),
    productId: input.productId,
    size: fileStats.size,
  });

  if (!input.wait) {
    return { clipId: upload.clipId };
  }

  return await waitForUploadCompletion(credentials, upload.clipId);
}
