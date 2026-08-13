import type { StudioEditorTextStyle } from "./StudioEditorTextStyle";

export type StudioEditorCaptionStyle = {
  text: StudioEditorTextStyle;
  activeColor: string;
  maxWidthRatio: number;
  positionYRatio: number;
  wordsPerPage: number;
};
