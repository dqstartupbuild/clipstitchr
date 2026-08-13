const allowedContentTypes = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
  "video/x-matroska",
]);

export function validateStudioClipsVideoFile(file: File) {
  if (!allowedContentTypes.has(file.type)) {
    throw new Error("Choose an MP4, MOV, WebM, M4V, or MKV video.");
  }

  if (file.size <= 0 || file.size > 1_073_741_824) {
    throw new Error("Choose a video smaller than 1 GB.");
  }

  return file;
}
