import type { StudioStitchTextOverlayPlan } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchTextOverlayPlan";
import { escapeStudioReelAssText } from "./escapeStudioReelAssText";
import { toStudioReelAssColor } from "./toStudioReelAssColor";
import { toStudioReelAssTime } from "./toStudioReelAssTime";
import { wrapStudioReelOverlayText } from "./wrapStudioReelOverlayText";

export function createStudioReelOverlayAss(
  overlays: readonly StudioStitchTextOverlayPlan[],
) {
  const header = [
    "[Script Info]",
    "ScriptType: v4.00+",
    "PlayResX: 1080",
    "PlayResY: 1920",
    "WrapStyle: 2",
    "ScaledBorderAndShadow: yes",
    "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    "Style: Default,TikTok Sans,66,&H00FFFFFF&,&H00FFFFFF&,&H00000000&,&HFF000000&,-1,0,0,0,100,100,0,0,1,8,0,5,0,0,0,1",
    "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
  ];
  const events = [...overlays]
    .sort(
      (left, right) =>
        left.startSeconds - right.startSeconds || left.id.localeCompare(right.id),
    )
    .map((overlay) => {
      const style = overlay.style;
      const text = escapeStudioReelAssText(
        wrapStudioReelOverlayText(
          overlay.text,
          style.fontSizePixels,
          style.maxWidthPixels,
        ),
      ).replace(/\\\\N/g, "\\N");
      const tags = [
        "\\an5",
        `\\pos(${Math.round(overlay.centerXPixels)},${Math.round(overlay.centerYPixels)})`,
        `\\fs${Math.round(style.fontSizePixels)}`,
        `\\b${style.fontWeight >= 700 ? 1 : 0}`,
        `\\c${toStudioReelAssColor(style.color)}`,
        `\\3c${toStudioReelAssColor(style.outlineColor)}`,
        `\\bord${style.outlineWidthPixels}`,
      ].join("");
      return `Dialogue: 0,${toStudioReelAssTime(overlay.startSeconds)},${toStudioReelAssTime(overlay.endSeconds)},Default,,0,0,0,,{${tags}}${text}`;
    });
  return [...header, ...events, ""].join("\n");
}
