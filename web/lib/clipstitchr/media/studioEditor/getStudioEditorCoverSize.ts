export function getStudioEditorCoverSize(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
) {
  const scale = Math.max(
    targetWidth / sourceWidth,
    targetHeight / sourceHeight,
  );

  return {
    width: sourceWidth * scale,
    height: sourceHeight * scale,
  };
}
