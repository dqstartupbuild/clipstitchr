import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";
import { getTextOverlayColor } from "@/lib/clipr/utils/getTextOverlayColor";
import { getTextOverlayIsVisible } from "@/lib/clipr/utils/getTextOverlayIsVisible";
import { getTextOverlayStyle } from "@/lib/clipr/utils/getTextOverlayStyle";

type TextOverlayCanvasContext =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

export function drawTextOverlay(
  context: TextOverlayCanvasContext,
  textOverlay: TextOverlay,
  currentTime: number,
) {
  if (!getTextOverlayIsVisible(textOverlay, currentTime)) {
    return;
  }

  const style = getTextOverlayStyle(textOverlay.styleId);
  const canvasWidth = context.canvas.width;
  const canvasHeight = context.canvas.height;
  const fontSize = Math.max(
    1,
    textOverlay.fontSize * (style.fontScale ?? 1) * canvasHeight,
  );
  const boxLeft = textOverlay.x * canvasWidth;
  const boxTop = textOverlay.y * canvasHeight;
  const boxWidth = textOverlay.width * canvasWidth;
  const backgroundLeft = style.fullWidthBand ? 0 : boxLeft;
  const backgroundWidth = style.fullWidthBand ? canvasWidth : boxWidth;
  const paddingX = (style.paddingXRatio ?? 0) * fontSize;
  const paddingY = (style.paddingYRatio ?? 0) * fontSize;
  const maxTextWidth = Math.max(fontSize, backgroundWidth - paddingX * 2);
  const text =
    style.textTransform === "uppercase"
      ? textOverlay.text.toUpperCase()
      : textOverlay.text;

  context.save();
  context.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.lineJoin = "round";

  const lines = getTextOverlayLines(context, text, maxTextWidth);
  const lineHeight = fontSize * 1.12;
  const blockHeight = lines.length * lineHeight + paddingY * 2;
  const safeBoxTop = Math.min(boxTop, canvasHeight - blockHeight);
  const textCenterX = backgroundLeft + backgroundWidth / 2;

  if (style.backgroundColor) {
    const radius = style.fullWidthBand
      ? 0
      : (style.borderRadiusRatio ?? 0) * fontSize;

    context.fillStyle = style.backgroundColor;
    drawRoundRect(
      context,
      backgroundLeft,
      Math.max(0, safeBoxTop),
      backgroundWidth,
      blockHeight,
      radius,
    );
    context.fill();
  }

  context.fillStyle = getTextOverlayColor(textOverlay);
  context.strokeStyle = style.strokeColor ?? "transparent";
  context.lineWidth = (style.strokeWidthRatio ?? 0) * fontSize;
  context.shadowColor = style.shadowColor ?? "transparent";
  context.shadowBlur = (style.shadowBlurRatio ?? 0) * fontSize;
  context.shadowOffsetX = (style.shadowOffsetXRatio ?? 0) * fontSize;
  context.shadowOffsetY = (style.shadowOffsetYRatio ?? 0) * fontSize;

  lines.forEach((line, index) => {
    const lineY = Math.max(0, safeBoxTop) + paddingY + lineHeight * (index + 0.5);

    if (style.strokeColor && style.strokeWidthRatio) {
      context.strokeText(line, textCenterX, lineY, maxTextWidth);
    }

    context.fillText(line, textCenterX, lineY, maxTextWidth);
  });

  context.restore();
}

function getTextOverlayLines(
  context: TextOverlayCanvasContext,
  text: string,
  maxWidth: number,
) {
  const words = text.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (context.measureText(candidate).width <= maxWidth || !currentLine) {
      currentLine = candidate;
      return;
    }

    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.flatMap((line) => splitLongTextLine(context, line, maxWidth));
}

function splitLongTextLine(
  context: TextOverlayCanvasContext,
  line: string,
  maxWidth: number,
) {
  if (context.measureText(line).width <= maxWidth) {
    return [line];
  }

  const segments: string[] = [];
  let currentSegment = "";

  Array.from(line).forEach((character) => {
    const candidate = `${currentSegment}${character}`;

    if (context.measureText(candidate).width <= maxWidth || !currentSegment) {
      currentSegment = candidate;
      return;
    }

    segments.push(currentSegment);
    currentSegment = character;
  });

  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments;
}

function drawRoundRect(
  context: TextOverlayCanvasContext,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}
