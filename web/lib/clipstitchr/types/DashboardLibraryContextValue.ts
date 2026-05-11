import type { ClipLibraryValue } from "@/lib/clipstitchr/types/ClipLibraryValue";
import type { PhotoLibraryValue } from "@/lib/clipstitchr/types/PhotoLibraryValue";
import type { SwiprLibraryValue } from "@/lib/clipstitchr/types/SwiprLibraryValue";

export type DashboardLibraryContextValue = {
  clipLibrary: ClipLibraryValue;
  photoLibrary: PhotoLibraryValue;
  swiprLibrary: SwiprLibraryValue;
};
