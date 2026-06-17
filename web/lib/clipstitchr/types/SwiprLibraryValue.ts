import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprBackgroundSource } from "@/lib/clipstitchr/types/SwiprBackgroundSource";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

export type SaveSwiprBackgroundOptions = {
  blob: Blob;
  generationDetails?: string;
  libraryQuery?: string;
  originalName: string;
  pexelsPhotoId?: number;
  source: SwiprBackgroundSource;
};

export type RenameSwiprLibraryPackResult = {
  count: number;
  libraryQuery: string;
};

export type SaveSwiprSwipeInput = Omit<
  SwiprSwipe,
  | "createdAt"
  | "isPosted"
  | "postedAt"
  | "posterBlob"
  | "posterObject"
  | "posterVersion"
  | "updatedAt"
> & {
  createdAt?: string;
  updatedAt?: string;
};

export type SwiprLibraryValue = {
  backgrounds: SwiprBackgroundAsset[];
  postedSwipes: SwiprSwipe[];
  swipes: SwiprSwipe[];
  isLoading: boolean;
  isSavingBackground: boolean;
  isSavingSwipe: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  saveBackground: (
    options: SaveSwiprBackgroundOptions,
  ) => Promise<SwiprBackgroundAsset>;
  loadBackgroundBlob: (id: string) => Promise<Blob>;
  loadBackgroundAsset: (
    id: string,
  ) => Promise<(SwiprBackgroundAsset & { blob: Blob }) | null>;
  loadSwipePoster: (id: string) => Promise<Blob | null>;
  removeBackgroundFromLibraryPack: (id: string) => Promise<void>;
  removeLibraryPack: (libraryQuery: string) => Promise<number>;
  renameLibraryPack: (
    fromLibraryQuery: string,
    toLibraryQuery: string,
  ) => Promise<RenameSwiprLibraryPackResult>;
  saveSwipe: (input: SaveSwiprSwipeInput) => Promise<SwiprSwipe>;
  updateSwipePostedStatus: (
    swipe: SwiprSwipe,
    isPosted: boolean,
  ) => Promise<void>;
  removeSwipe: (id: string) => Promise<void>;
};
