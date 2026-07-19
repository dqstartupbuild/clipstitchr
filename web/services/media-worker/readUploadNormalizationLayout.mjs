export function readUploadNormalizationLayout(value) {
  if (
    value === "crop-fill" ||
    value === "fit-with-background"
  ) {
    return value;
  }

  return undefined;
}
