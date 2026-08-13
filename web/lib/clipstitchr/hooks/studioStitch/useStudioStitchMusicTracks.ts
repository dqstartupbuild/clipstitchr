"use client";

import { useSharedMusicTracks } from "@/lib/clipstitchr/hooks/useSharedMusicTracks";

export function useStudioStitchMusicTracks(enabled: boolean) {
  return useSharedMusicTracks(enabled);
}
