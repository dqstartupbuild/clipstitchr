import type { StudioEditorTextStyle } from "../../types/studioEditor/StudioEditorTextStyle";

export function createDefaultStudioEditorTextStyle(): StudioEditorTextStyle {
  return {
    fontFamily: "system-ui",
    fontSizePixels: 64,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacingPixels: 0,
    textAlign: "center",
    color: "#FFFFFF",
    backgroundColor: "#00000000",
    outlineColor: "#000000",
    outlineWidthPixels: 0,
  };
}
