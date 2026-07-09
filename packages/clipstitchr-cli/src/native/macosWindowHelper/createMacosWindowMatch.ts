import { formatMacosWindowLabel } from "./formatMacosWindowLabel.js";
import type { MacosWindowInfo } from "./MacosWindowInfo.js";

export function createMacosWindowMatch(window: MacosWindowInfo) {
  return formatMacosWindowLabel(window).slice(0, 160);
}
