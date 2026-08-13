export function getStudioReelMediaFileExtension(contentType: string) {
  const types: Record<string, string> = {
    "audio/aac": "aac",
    "audio/m4a": "m4a",
    "audio/mpeg": "mp3",
    "audio/mp4": "m4a",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/webm": "webm",
    "video/x-m4v": "m4v",
    "video/x-matroska": "mkv",
  };
  return types[contentType.toLowerCase().split(";", 1)[0] ?? ""] ?? "media";
}
