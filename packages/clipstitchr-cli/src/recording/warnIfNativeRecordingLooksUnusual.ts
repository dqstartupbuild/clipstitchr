import { readRecordingVideoDimensions } from "./readRecordingVideoDimensions.js";

export async function warnIfNativeRecordingLooksUnusual(outputPath: string) {
  const dimensions = await readRecordingVideoDimensions(outputPath);

  if (!dimensions) {
    return;
  }

  if (dimensions.width <= 0 || dimensions.height <= 0) {
    console.warn("ClipStitchr could not confirm the mobile recording size.");
    return;
  }

  if (dimensions.width > dimensions.height) {
    console.warn(
      `Mobile recording saved at ${dimensions.width}x${dimensions.height}. If this was meant to be a vertical app demo, rotate the simulator or device to portrait and record again.`,
    );
  }
}
