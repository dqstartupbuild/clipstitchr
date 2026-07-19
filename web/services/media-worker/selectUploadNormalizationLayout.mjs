const WIDE_DEMO_ASPECT_RATIO = 1.2;

export function selectUploadNormalizationLayout({
  clipType,
  requestedLayout,
  sourceAspectRatio,
}) {
  if (
    requestedLayout === "crop-fill" ||
    requestedLayout === "fit-with-background"
  ) {
    return requestedLayout;
  }

  if (
    clipType === "demo" &&
    Number.isFinite(sourceAspectRatio) &&
    sourceAspectRatio >= WIDE_DEMO_ASPECT_RATIO
  ) {
    return "fit-with-background";
  }

  return "crop-fill";
}
