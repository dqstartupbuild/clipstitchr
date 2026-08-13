import { extname } from "node:path";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";

const contentTypes: Record<string, string> = {
  ".m4v": "video/x-m4v",
  ".mkv": "video/x-matroska",
  ".mov": "video/quicktime",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export function getStudioClipsVideoContentType(localPath: string): string {
  const contentType = contentTypes[extname(localPath).toLowerCase()];
  if (!contentType) {
    throw new StudioClipsWorkerError({
      code: "UNSUPPORTED_INPUT_MEDIA",
      kind: "permanent",
      publicMessage: "The source is not a supported video file.",
    });
  }
  return contentType;
}
