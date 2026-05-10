import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { SWIPR_BACKGROUND_PRESETS } from "@/lib/clipstitchr/constants/swiprBackgroundPresets";
import type { SwiprBackgroundPresetId } from "@/lib/clipstitchr/types/SwiprBackgroundPresetId";
import { createBlobFromCanvas } from "@/lib/clipstitchr/media/createBlobFromCanvas";

const BACKGROUND_QUALITY = 0.92;

export async function createSwiprBackgroundBlob(
  productContext: string,
  presetId: SwiprBackgroundPresetId,
) {
  const preset =
    SWIPR_BACKGROUND_PRESETS.find((background) => background.id === presetId) ??
    SWIPR_BACKGROUND_PRESETS[0];
  const canvas = document.createElement("canvas");
  canvas.width = TIKTOK_OUTPUT_WIDTH;
  canvas.height = TIKTOK_OUTPUT_HEIGHT;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create Swipr background canvas.");
  }

  const hue = getProductHue(productContext);
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);

  gradient.addColorStop(0, preset.baseColor);
  gradient.addColorStop(0.48, `hsl(${hue} 86% 94%)`);
  gradient.addColorStop(1, "#ffffff");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawPanel(context, 72, 124, 936, 560, preset.accentColor, 0.16);
  drawPanel(context, -120, 738, 1240, 430, preset.secondaryColor, 0.12);
  drawShelf(context, preset.accentColor, preset.secondaryColor);
  drawTexture(context, hue);

  return createBlobFromCanvas(canvas, "image/jpeg", BACKGROUND_QUALITY);
}

function getProductHue(productContext: string) {
  const normalized = productContext.trim() || "swipr";

  return Array.from(normalized).reduce(
    (hash, character) => (hash * 31 + character.charCodeAt(0)) % 360,
    29,
  );
}

function drawPanel(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  alpha: number,
) {
  context.save();
  context.globalAlpha = alpha;
  context.fillStyle = color;
  context.beginPath();
  context.roundRect(x, y, width, height, 46);
  context.fill();
  context.restore();
}

function drawShelf(
  context: CanvasRenderingContext2D,
  accentColor: string,
  secondaryColor: string,
) {
  context.save();
  context.fillStyle = "rgba(255, 255, 255, 0.74)";
  context.fillRect(90, 1300, 900, 110);
  context.fillStyle = accentColor;
  context.globalAlpha = 0.18;
  context.fillRect(126, 1398, 828, 18);
  context.globalAlpha = 0.16;
  context.fillStyle = secondaryColor;
  context.fillRect(174, 1448, 732, 26);
  context.restore();
}

function drawTexture(context: CanvasRenderingContext2D, hue: number) {
  context.save();
  context.strokeStyle = `hsla(${(hue + 84) % 360} 72% 34% / 0.08)`;
  context.lineWidth = 2;

  for (let index = 0; index < 12; index += 1) {
    const y = 188 + index * 126;

    context.beginPath();
    context.moveTo(112, y);
    context.lineTo(968, y + 34);
    context.stroke();
  }

  context.restore();
}
