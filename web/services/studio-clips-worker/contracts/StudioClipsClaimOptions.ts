export type StudioClipsClaimCaptionStyle = {
  customFontObjectKey?: string;
  fontColorHex?: string;
  fontFamily?: string;
  fontSizePx?: number;
  templateId: string;
};

export type StudioClipsClaimOptions = {
  addSubtitles: boolean;
  captionStyle?: StudioClipsClaimCaptionStyle;
  includeBroll: boolean;
  outputFormat: "source" | "vertical";
};
