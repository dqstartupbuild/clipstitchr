import type { Output } from "mediabunny";

export async function getVideoMimeType(output: Output) {
  try {
    return await output.getMimeType();
  } catch {
    return "video/mp4";
  }
}
