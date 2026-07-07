import { stat } from "node:fs/promises";
import { basename } from "node:path";
import { completeDemoUpload } from "../api/completeDemoUpload.js";
import { createDemoUpload } from "../api/createDemoUpload.js";
import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import type { DemoWalkthroughUploadMetadata } from "../demoGuide/DemoWalkthroughUploadMetadata.js";
import type { RecordingInteractionEvent } from "../recording/RecordingInteractionEvent.js";
import { getVideoContentType } from "./getVideoContentType.js";
import type { UploadNormalizationLayout } from "./UploadNormalizationLayout.js";
import { uploadFileToSignedUrl } from "./uploadFileToSignedUrl.js";
import { waitForUploadCompletion } from "./waitForUploadCompletion.js";

export async function uploadDemoFile(
  credentials: ClipstitchrCredentials,
  input: {
    filePath: string;
    interactionEvents?: RecordingInteractionEvent[];
    layout?: UploadNormalizationLayout;
    productId: string;
    wait: boolean;
    walkthrough?: DemoWalkthroughUploadMetadata;
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
    interactionEvents: input.interactionEvents,
    key: upload.sourceVideoObject.key,
    layout: input.layout,
    originalName: basename(input.filePath),
    productId: input.productId,
    size: fileStats.size,
    walkthrough: input.walkthrough,
  });

  if (!input.wait) {
    return { clipId: upload.clipId };
  }

  return await waitForUploadCompletion(credentials, upload.clipId);
}
