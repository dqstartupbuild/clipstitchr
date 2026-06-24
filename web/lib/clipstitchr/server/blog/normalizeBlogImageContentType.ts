export function normalizeBlogImageContentType(contentType: string) {
  return contentType.split(";")[0]?.trim().toLowerCase() ?? "";
}
