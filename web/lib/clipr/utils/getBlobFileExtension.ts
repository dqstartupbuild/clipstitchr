export function getBlobFileExtension(blob: Blob, fallback: string) {
  const subtype = blob.type.split("/")[1]?.split(";")[0];

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
