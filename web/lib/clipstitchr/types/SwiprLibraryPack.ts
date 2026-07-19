import type { SwiprLibraryPackCover } from "@/lib/clipstitchr/types/SwiprLibraryPackCover";

export type SwiprLibraryPack = {
  accountCount?: number;
  accountCovers?: SwiprLibraryPackCover[];
  count: number;
  coverBackgroundIds: string[];
  covers?: SwiprLibraryPackCover[];
  isInAccount?: boolean;
  name: string;
};
