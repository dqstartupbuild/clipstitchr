import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";

export function convertStudioClipsHexToAssColor(value: string): string {
  if (!/^#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?$/.test(value)) {
    throw new StudioClipsWorkerError({
      code: "INVALID_CAPTION_COLOR",
      kind: "permanent",
      publicMessage: "The selected caption color is invalid.",
    });
  }
  const red = value.slice(1, 3);
  const green = value.slice(3, 5);
  const blue = value.slice(5, 7);
  const cssAlpha = value.length === 9 ? Number.parseInt(value.slice(7, 9), 16) : 255;
  const assAlpha = (255 - cssAlpha).toString(16).toUpperCase().padStart(2, "0");
  return `&H${assAlpha}${blue}${green}${red}&`.toUpperCase();
}
