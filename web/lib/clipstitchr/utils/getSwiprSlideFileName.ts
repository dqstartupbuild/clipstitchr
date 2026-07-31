export function getSwiprSlideFileName(
  index: number,
  mimeType: "image/jpeg" | "image/png" = "image/png",
) {
  const extension = mimeType === "image/jpeg" ? "jpg" : "png";

  return `swipr-slide-${String(index + 1).padStart(2, "0")}.${extension}`;
}
