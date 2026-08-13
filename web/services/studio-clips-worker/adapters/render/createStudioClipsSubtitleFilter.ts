import type { StudioClipsResolvedCaptionStyle } from "./StudioClipsResolvedCaptionStyle";
import { escapeStudioClipsFfmpegFilterValue } from "./escapeStudioClipsFfmpegFilterValue";

export function createStudioClipsSubtitleFilter(input: {
  style: StudioClipsResolvedCaptionStyle;
  subtitlePath: string;
}): string {
  const forceStyle = [
    "Alignment=2",
    `BackColour=${input.style.backColorAss}`,
    `BorderStyle=${input.style.borderStyle}`,
    `FontName=${input.style.fontFamily}`,
    `FontSize=${input.style.fontSizePx}`,
    `MarginV=${input.style.marginVertical}`,
    `Outline=${input.style.outlineWidth}`,
    `OutlineColour=${input.style.outlineColorAss}`,
    `PrimaryColour=${input.style.fontColorAss}`,
    `Shadow=${input.style.shadowDepth}`,
  ].join(",");
  return `subtitles=filename='${escapeStudioClipsFfmpegFilterValue(
    input.subtitlePath,
  )}':fontsdir='${escapeStudioClipsFfmpegFilterValue(
    input.style.fontsDirectory,
  )}':force_style='${escapeStudioClipsFfmpegFilterValue(forceStyle)}'`;
}
