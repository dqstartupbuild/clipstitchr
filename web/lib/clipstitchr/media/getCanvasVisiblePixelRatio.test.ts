import { describe, expect, it, vi } from "vitest";
import { getCanvasVisiblePixelRatio } from "@/lib/clipstitchr/media/getCanvasVisiblePixelRatio";

function createImageData(width: number, height: number) {
  return new Uint8ClampedArray(width * height * 4);
}

function setPixel(
  pixels: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
  red: number,
  green: number,
  blue: number,
) {
  const index = (y * width + x) * 4;
  pixels[index] = red;
  pixels[index + 1] = green;
  pixels[index + 2] = blue;
  pixels[index + 3] = 255;
}

describe("getCanvasVisiblePixelRatio", () => {
  it("samples visible pixels by luma threshold", () => {
    const width = 32;
    const height = 32;
    const pixels = createImageData(width, height);

    setPixel(pixels, width, 0, 0, 255, 255, 255);
    setPixel(pixels, width, 16, 0, 10, 10, 10);
    setPixel(pixels, width, 0, 16, 64, 64, 64);
    setPixel(pixels, width, 16, 16, 0, 0, 0);

    const context = {
      getImageData: vi.fn(() => ({ data: pixels })),
    } as unknown as CanvasRenderingContext2D;

    expect(getCanvasVisiblePixelRatio(context, width, height)).toBe(0.5);
    expect(context.getImageData).toHaveBeenCalledWith(0, 0, width, height);
  });

  it("returns zero when no pixels are sampled", () => {
    const context = {
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray() })),
    } as unknown as CanvasRenderingContext2D;

    expect(getCanvasVisiblePixelRatio(context, 0, 0)).toBe(0);
  });
});
