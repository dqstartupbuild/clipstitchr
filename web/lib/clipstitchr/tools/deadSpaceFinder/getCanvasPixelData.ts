export function getCanvasPixelData(
  canvas: HTMLCanvasElement | OffscreenCanvas,
) {
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context || !("getImageData" in context)) {
    throw new Error("This browser could not read the sampled video frames.");
  }

  return context.getImageData(0, 0, canvas.width, canvas.height).data;
}
