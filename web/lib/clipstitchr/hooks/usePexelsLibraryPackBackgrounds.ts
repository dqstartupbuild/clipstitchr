"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createSwiprBackgroundAssetFromConvexDocument } from "@/lib/clipstitchr/backend/createSwiprBackgroundAssetFromConvexDocument";

export function usePexelsLibraryPackBackgrounds(
  libraryQuery: string | null,
  applyAccountExclusions: boolean,
) {
  const documents = useQuery(
    api.swiprBackgrounds.listGlobalPexelsPack,
    libraryQuery
      ? {
          applyAccountExclusions,
          libraryQuery,
        }
      : "skip",
  );
  const backgrounds = useMemo(
    () =>
      documents?.map((background) =>
        createSwiprBackgroundAssetFromConvexDocument(background),
      ) ?? [],
    [documents],
  );

  return {
    backgrounds,
    isLoading: Boolean(libraryQuery) && documents === undefined,
  };
}
