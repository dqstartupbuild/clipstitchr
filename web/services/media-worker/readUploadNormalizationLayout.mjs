export function readUploadNormalizationLayout(value) {
  if (
    value === "crop-fill" ||
    value === "fit-with-background" ||
    value === "smart-screen-demo"
  ) {
    return value;
  }

  return undefined;
}
