import type { TextOverlayStyleId } from "@/lib/clipr/types/TextOverlayStyleId";

export type TextOverlayStyle = {
  id: TextOverlayStyleId;
  label: string;
  fontFamily: string;
  fontWeight: string;
  fontScale?: number;
  color: string;
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidthRatio?: number;
  shadowColor?: string;
  shadowBlurRatio?: number;
  shadowOffsetXRatio?: number;
  shadowOffsetYRatio?: number;
  textTransform?: "uppercase";
  paddingXRatio?: number;
  paddingYRatio?: number;
  borderRadiusRatio?: number;
  fullWidthBand?: boolean;
};
