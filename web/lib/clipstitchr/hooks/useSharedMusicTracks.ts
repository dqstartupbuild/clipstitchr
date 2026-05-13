"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

export function useSharedMusicTracks() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const tracks = useQuery(
    api.sharedMusicTracks.list,
    isAuthenticated ? {} : "skip",
  ) as SharedMusicTrack[] | undefined;

  return {
    isLoading: isAuthLoading || (isAuthenticated && tracks === undefined),
    tracks: tracks ?? [],
  };
}
