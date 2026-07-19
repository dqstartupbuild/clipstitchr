import type { Doc } from "./_generated/dataModel";
import { getSwiprBackgroundCardSearchText } from "./getSwiprBackgroundCardSearchText";
import { normalizeSwiprLibraryQueryKey } from "../lib/clipstitchr/utils/normalizeSwiprLibraryQueryKey";

export type SwiprBackgroundCardFieldSource = {
  createdAt: string;
  description?: string;
  details?: string;
  height: number;
  id: string;
  imageObject: Doc<"swiprBackgrounds">["imageObject"];
  libraryQuery?: string;
  libraryQueryKey?: string;
  mimeType: string;
  name: string;
  pexelsPhotoId?: number;
  size: number;
  source: Doc<"swiprBackgrounds">["source"];
  tags: string[];
  uploadedByOwnerId: string;
  width: number;
};

export function createSwiprBackgroundCardFields(
  background: SwiprBackgroundCardFieldSource,
) {
  return {
    id: background.id,
    uploadedByOwnerId: background.uploadedByOwnerId,
    name: background.name,
    tags: background.tags,
    description: background.description,
    searchText: getSwiprBackgroundCardSearchText(background),
    libraryQuery: background.libraryQuery,
    libraryQueryKey:
      background.libraryQueryKey ??
      normalizeSwiprLibraryQueryKey(background.libraryQuery),
    pexelsPhotoId: background.pexelsPhotoId,
    source: background.source,
    imageObject: background.imageObject,
    mimeType: background.mimeType,
    size: background.size,
    width: background.width,
    height: background.height,
    createdAt: background.createdAt,
  };
}
