import type { TextOverlayStyleId } from "./TextOverlayStyleId";

export type TextOverlay = {
  id?: string;
  text: string;
  startTime: number;
  endTime: number;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  styleId: TextOverlayStyleId;
  color?: string;
  backgroundColor?: string;
  strokeColor?: string;
};
