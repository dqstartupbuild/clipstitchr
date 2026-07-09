import type { MacosWindowBounds } from "./MacosWindowBounds.js";

export type MacosWindowInfo = {
  appName: string;
  bounds: MacosWindowBounds;
  id: number;
  pid: number;
  title: string;
};
