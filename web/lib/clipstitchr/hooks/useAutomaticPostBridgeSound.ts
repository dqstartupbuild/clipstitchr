"use client";

import { useCallback, useMemo, useState } from "react";
import { importTikTokSound } from "@/lib/clipstitchr/client/importTikTokSound";
import { searchTikTokSounds } from "@/lib/clipstitchr/client/searchTikTokSounds";
import { useSharedMusicTracks } from "@/lib/clipstitchr/hooks/useSharedMusicTracks";
import { useSoundPreferences } from "@/lib/clipstitchr/hooks/useSoundPreferences";
import type { AutomaticPostBridgeSoundSource } from "@/lib/clipstitchr/types/AutomaticPostBridgeSoundSource";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import { selectAutomaticSharedMusicTrack } from "@/lib/clipstitchr/utils/selectAutomaticSharedMusicTrack";
import { selectAutomaticTikTokSoundCandidate } from "@/lib/clipstitchr/utils/selectAutomaticTikTokSoundCandidate";

type UseAutomaticPostBridgeSoundOptions = {
  enabled: boolean;
  searchQuery: string;
};

export function useAutomaticPostBridgeSound({
  enabled,
  searchQuery,
}: UseAutomaticPostBridgeSoundOptions) {
  const library = useSharedMusicTracks(enabled);
  const soundPreferences = useSoundPreferences(enabled);
  const [isAcceptingRights, setIsAcceptingRights] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [importedTrack, setImportedTrack] = useState<{
    query: string;
    source: AutomaticPostBridgeSoundSource;
    track: SharedMusicTrack;
  } | null>(null);
  const savedTrack = useMemo(
    () => selectAutomaticSharedMusicTrack(library.tracks, searchQuery),
    [library.tracks, searchQuery],
  );
  const selectedTrack =
    savedTrack ??
    (importedTrack?.query === searchQuery ? importedTrack.track : null);
  const selectedSource: AutomaticPostBridgeSoundSource | null = savedTrack
    ? "saved"
    : importedTrack?.query === searchQuery
      ? importedTrack.source
      : null;
  const canResolve = Boolean(
    selectedTrack || soundPreferences.hasAcceptedRights,
  );

  const acceptRights = useCallback(async () => {
    setIsAcceptingRights(true);

    try {
      await soundPreferences.acceptRights();
    } finally {
      setIsAcceptingRights(false);
    }
  }, [soundPreferences]);

  const resolveSound = useCallback(async () => {
    if (!enabled) {
      return null;
    }

    if (selectedTrack) {
      return selectedTrack;
    }

    if (!soundPreferences.hasAcceptedRights) {
      throw new Error("Continue first so ClipStitchr can find a sound.");
    }

    setIsResolving(true);

    try {
      const candidate = selectAutomaticTikTokSoundCandidate(
        await searchTikTokSounds(searchQuery),
      );

      if (!candidate?.sourceUrl) {
        throw new Error(
          "I could not find a sound for this Swipe. Choose a sound or use no sound.",
        );
      }

      const track = await importTikTokSound(candidate.sourceUrl);

      setImportedTrack({
        query: searchQuery,
        source: "tiktok",
        track,
      });

      return track;
    } finally {
      setIsResolving(false);
    }
  }, [enabled, searchQuery, selectedTrack, soundPreferences.hasAcceptedRights]);

  return {
    acceptRights,
    canResolve,
    hasAcceptedRights: soundPreferences.hasAcceptedRights,
    isAcceptingRights,
    isLoading: library.isLoading || soundPreferences.isLoading,
    isResolving,
    resolveSound,
    selectedSource,
    selectedTrack,
  };
}
