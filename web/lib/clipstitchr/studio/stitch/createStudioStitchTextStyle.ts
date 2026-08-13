import type { StudioStitchTextOverlayRole } from "../../types/studioStitch/StudioStitchTextOverlayRole";
import type { StudioStitchTextStyle } from "../../types/studioStitch/StudioStitchTextStyle";

export function createStudioStitchTextStyle(
  role: StudioStitchTextOverlayRole,
  text: string,
  emphasis: boolean,
): StudioStitchTextStyle {
  const fontSizePixels =
    role === "cta"
      ? 92
      : role === "caption"
        ? text.length <= 14
          ? 78
          : 66
        : role === "hook"
          ? 78
          : 66;
  return {
    fontFamily: "TikTok Sans",
    fontWeight: role === "supporting" ? 700 : 900,
    fontSizePixels,
    color: emphasis || role === "cta" ? "#FFE600" : "#FFFFFF",
    backgroundColor: "#00000000",
    outlineColor: "#000000",
    outlineWidthPixels: role === "cta" ? 10 : role === "supporting" ? 6 : 8,
    textAlign: "center",
    maxWidthPixels: 900,
  };
}
