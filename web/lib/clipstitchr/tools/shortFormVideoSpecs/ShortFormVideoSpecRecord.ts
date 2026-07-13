import type { ShortFormVideoPlatform } from "@/lib/clipstitchr/tools/shortFormVideoSpecs/ShortFormVideoPlatform";

export type ShortFormVideoSpecRecord = {
  audio: string;
  codec: string;
  containers: string;
  dimensions: string;
  duration: string;
  fileLimit: string;
  frameRate: string;
  id: string;
  lastVerified: string;
  placement: string;
  platform: ShortFormVideoPlatform;
  practicalNotes: readonly string[];
  ratio: string;
  sourceTitle: string;
  sourceUrl: string;
};
