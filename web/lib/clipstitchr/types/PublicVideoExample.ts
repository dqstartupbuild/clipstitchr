import type { PublicVideoExampleKind } from "@/lib/clipstitchr/types/PublicVideoExampleKind";

export type PublicVideoExample = {
  id: string;
  slug: string;
  title: string;
  displayTitle: string;
  description: string;
  kind: PublicVideoExampleKind;
  videoSrc: string;
  thumbnailSrc: string;
  durationSeconds: number;
  uploadDate: string;
  width: number;
  height: number;
  tags: string[];
};
