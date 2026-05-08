export function getUploadFallbackName(fileName: string) {
  const withoutExtension = fileName.trim().replace(/\.[^/.]+$/, "").trim();

  return withoutExtension || "Untitled upload";
}
