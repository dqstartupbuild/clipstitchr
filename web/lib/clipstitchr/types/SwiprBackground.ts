import type { SwiprBackgroundSource } from "@/lib/clipstitchr/types/SwiprBackgroundSource";

export type SwiprBackground = {
  id?: string;
  name: string;
  blob: Blob;
  source: SwiprBackgroundSource;
};
