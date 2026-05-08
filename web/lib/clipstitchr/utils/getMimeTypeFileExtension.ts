export function getMimeTypeFileExtension(
  mimeType: string | undefined,
  fallback: string,
) {
  const subtype = mimeType?.split("/")[1]?.split(";")[0];

  if (!subtype) {
    return fallback;
  }

  if (subtype === "jpeg") {
    return "jpg";
  }

  if (subtype === "quicktime") {
    return "mov";
  }

  return subtype;
}
