import type { MacosWindowInfo } from "./MacosWindowInfo.js";

export type MacosWindowScreenshot = {
  base64: string;
  height: number;
  width: number;
  window: MacosWindowInfo;
};
