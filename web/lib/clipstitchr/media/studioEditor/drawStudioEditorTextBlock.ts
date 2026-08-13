import { getStudioEditorWrappedTextLines } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorWrappedTextLines";
import type { StudioEditorTextStyle } from "@/lib/clipstitchr/types/studioEditor/StudioEditorTextStyle";

type DrawStudioEditorTextBlockOptions = {
  centerX: number;
  centerY: number;
  context: CanvasRenderingContext2D;
  maxWidth: number;
  style: StudioEditorTextStyle;
  text: string;
};

export function drawStudioEditorTextBlock({
  centerX,
  centerY,
  context,
  maxWidth,
  style,
  text,
}: DrawStudioEditorTextBlockOptions) {
  context.font = `${style.fontWeight} ${style.fontSizePixels}px ${style.fontFamily}`;
  context.textAlign = style.textAlign;
  context.textBaseline = "middle";
  context.lineJoin = "round";
  const lines = getStudioEditorWrappedTextLines(context, text, maxWidth);
  const lineHeight = style.fontSizePixels * style.lineHeight;
  const blockHeight = Math.max(lineHeight, lines.length * lineHeight);
  const x =
    style.textAlign === "left"
      ? centerX - maxWidth / 2
      : style.textAlign === "right"
        ? centerX + maxWidth / 2
        : centerX;

  if (style.backgroundColor !== "#00000000" && style.backgroundColor !== "transparent") {
    context.fillStyle = style.backgroundColor;
    context.fillRect(
      centerX - maxWidth / 2 - style.fontSizePixels * 0.2,
      centerY - blockHeight / 2 - style.fontSizePixels * 0.12,
      maxWidth + style.fontSizePixels * 0.4,
      blockHeight + style.fontSizePixels * 0.24,
    );
  }

  for (const [index, line] of lines.entries()) {
    const y = centerY - blockHeight / 2 + lineHeight * (index + 0.5);

    if (style.outlineWidthPixels > 0) {
      context.lineWidth = style.outlineWidthPixels * 2;
      context.strokeStyle = style.outlineColor;
      context.strokeText(line, x, y, maxWidth);
    }

    context.fillStyle = style.color;
    context.fillText(line, x, y, maxWidth);
  }
}
