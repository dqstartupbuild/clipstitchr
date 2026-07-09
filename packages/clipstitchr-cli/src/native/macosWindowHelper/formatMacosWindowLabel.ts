import type { MacosWindowInfo } from "./MacosWindowInfo.js";

export function formatMacosWindowLabel(window: MacosWindowInfo) {
  const title = window.title.trim();

  return title ? `${window.appName} - ${title}` : window.appName;
}
