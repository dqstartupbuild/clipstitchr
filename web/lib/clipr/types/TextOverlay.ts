import type { TextOverlayStyleId } from "@/lib/clipr/types/TextOverlayStyleId";

export type TextOverlay = {
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
