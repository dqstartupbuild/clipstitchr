import type { QuickEditCrop } from "@/lib/clipstitchr/types/QuickEditCrop";

type GetQuickEditCropDrawRectOptions = {
  crop?: QuickEditCrop;
  height: number;
  width: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getQuickEditCropDrawRect({
  crop,
  height,
  width,
}: GetQuickEditCropDrawRectOptions) {
  const scale = clamp(crop?.scale ?? 1, 1, 3);
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  const rawX =
    (width - drawWidth) / 2 + clamp(crop?.positionX ?? 0, -1, 1) * width * 0.5;
  const rawY =
    (height - drawHeight) / 2 +
    clamp(crop?.positionY ?? 0, -1, 1) * height * 0.5;

  return {
    height: drawHeight,
    width: drawWidth,
    x: clamp(rawX, width - drawWidth, 0),
    y: clamp(rawY, height - drawHeight, 0),
  };
}
