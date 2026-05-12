import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprBackgroundSource } from "@/lib/clipstitchr/types/SwiprBackgroundSource";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

export type SaveSwiprBackgroundOptions = {
  blob: Blob;
  generationDetails?: string;
  originalName: string;
  source: SwiprBackgroundSource;
};

export type SaveSwiprSwipeInput = Omit<
  SwiprSwipe,
  "createdAt" | "updatedAt"
> & {
  createdAt?: string;
  updatedAt?: string;
};

export type SwiprLibraryValue = {
  backgrounds: SwiprBackgroundAsset[];
  swipes: SwiprSwipe[];
  isLoading: boolean;
  isSavingBackground: boolean;
  isSavingSwipe: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  saveBackground: (
    options: SaveSwiprBackgroundOptions,
  ) => Promise<SwiprBackgroundAsset>;
  saveSwipe: (input: SaveSwiprSwipeInput) => Promise<SwiprSwipe>;
  removeSwipe: (id: string) => Promise<void>;
};
