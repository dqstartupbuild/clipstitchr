const extensionByContentType: Record<string, string> = {
  "image/avif": "avif",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function getBlogImageExtension(contentType: string) {
  return extensionByContentType[contentType] ?? "jpg";
}
