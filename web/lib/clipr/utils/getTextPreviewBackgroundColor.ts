import { getHexColorLuminance } from "@/lib/clipr/utils/getHexColorLuminance";

export function getTextPreviewBackgroundColor(color: string) {
  return getHexColorLuminance(color) > 0.62 ? "#111827" : "#f8fafc";
}
