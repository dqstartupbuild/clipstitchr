import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";

const extensions: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/webm": ".webm",
  "video/x-m4v": ".m4v",
  "video/x-matroska": ".mkv",
};

export function getStudioClipsVideoExtension(contentType: string): string {
  const extension = extensions[contentType];
  if (!extension) {
    throw new StudioClipsWorkerError({
      code: "UNSUPPORTED_INPUT_MEDIA",
      kind: "permanent",
      publicMessage: "The source is not a supported video file.",
    });
  }
  return extension;
}
