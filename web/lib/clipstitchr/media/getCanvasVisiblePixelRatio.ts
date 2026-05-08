const VISIBLE_PIXEL_LUMA_THRESHOLD = 32;
const CANVAS_SAMPLE_STRIDE = 16;

export function getCanvasVisiblePixelRatio(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const pixels = context.getImageData(0, 0, width, height).data;
  let visiblePixels = 0;
  let sampledPixels = 0;

  for (let y = 0; y < height; y += CANVAS_SAMPLE_STRIDE) {
    for (let x = 0; x < width; x += CANVAS_SAMPLE_STRIDE) {
      const index = (y * width + x) * 4;
      const red = pixels[index] ?? 0;
      const green = pixels[index + 1] ?? 0;
      const blue = pixels[index + 2] ?? 0;
      const luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

      sampledPixels += 1;

      if (luma >= VISIBLE_PIXEL_LUMA_THRESHOLD) {
        visiblePixels += 1;
      }
    }
  }

  return sampledPixels === 0 ? 0 : visiblePixels / sampledPixels;
}
