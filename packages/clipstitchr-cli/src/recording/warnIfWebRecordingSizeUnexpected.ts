import { readRecordingVideoDimensions } from "./readRecordingVideoDimensions.js";
import { webRecordingViewport } from "./webRecordingViewport.js";
import { logWarning } from "../terminal/logWarning.js";

export async function warnIfWebRecordingSizeUnexpected(outputPath: string) {
  const dimensions = await readRecordingVideoDimensions(outputPath);

  if (!dimensions) {
    return;
  }

  if (
    dimensions.width === webRecordingViewport.width &&
    dimensions.height === webRecordingViewport.height
  ) {
    return;
  }

  logWarning(
    `Recording saved at ${dimensions.width}x${dimensions.height}, but ClipStitchr expected ${webRecordingViewport.width}x${webRecordingViewport.height}. If the video has empty space, record again after updating the CLI.`,
  );
}
