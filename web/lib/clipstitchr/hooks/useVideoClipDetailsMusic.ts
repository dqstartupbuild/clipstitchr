"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { downloadMusicBlob } from "@/lib/clipstitchr/client/r2/downloadMusicBlob";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { VideoClipDetailsMusicEditor } from "@/lib/clipstitchr/types/VideoClipDetailsMusicEditor";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { createCliprMusicMetadataFromSharedTrack } from "@/lib/clipstitchr/utils/createCliprMusicMetadataFromSharedTrack";
import { createMusicMetadataComparisonKey } from "@/lib/clipstitchr/utils/createMusicMetadataComparisonKey";

type UseVideoClipDetailsMusicOptions = {
  clip: VideoClipMetadata;
  musicEditor?: VideoClipDetailsMusicEditor;
};

export function useVideoClipDetailsMusic({
  clip,
  musicEditor,
}: UseVideoClipDetailsMusicOptions) {
  const initialMusic = clip.cliprMetadata?.music ?? null;
  const [music, setMusic] = useState<CliprMusicMetadata | null>(
    initialMusic,
  );
  const [savedMusic, setSavedMusic] = useState<CliprMusicMetadata | null>(
    initialMusic,
  );
  const [musicEnabled, setMusicEnabled] = useState(
    clip.cliprMetadata?.music?.enabled ?? true,
  );
  const [musicVolume, setMusicVolume] = useState(
    clip.cliprMetadata?.music?.volume ?? 1,
  );
  const [musicBlobState, setMusicBlobState] = useState<{
    blob: Blob;
    key: string;
  } | null>(null);
  const [musicLoadError, setMusicLoadError] = useState<string | null>(null);
  const [isMusicLoading, setIsMusicLoading] = useState(false);
  const musicObject = music?.audioObject ?? null;
  const musicObjectKey = musicObject?.key ?? null;
  const musicBlob =
    musicObjectKey && musicBlobState?.key === musicObjectKey
      ? musicBlobState.blob
      : null;
  const currentMusic = useMemo(
    () =>
      music
        ? {
            ...music,
            enabled: musicEnabled,
            volume: musicVolume,
          }
        : null,
    [music, musicEnabled, musicVolume],
  );
  const hasUnsavedChanges =
    createMusicMetadataComparisonKey(currentMusic) !==
    createMusicMetadataComparisonKey(savedMusic);

  useEffect(() => {
    let isCancelled = false;

    if (!music || !musicObject || !musicObjectKey) {
      void Promise.resolve().then(() => {
        if (!isCancelled) {
          setMusicBlobState(null);
          setMusicLoadError(null);
          setIsMusicLoading(false);
        }
      });

      return () => {
        isCancelled = true;
      };
    }

    if (musicBlobState?.key === musicObjectKey) {
      return () => {
        isCancelled = true;
      };
    }

    void Promise.resolve().then(() => {
      if (!isCancelled) {
        setIsMusicLoading(true);
        setMusicLoadError(null);
      }
    });

    void downloadMusicBlob(music)
      .then((blob) => {
        if (!isCancelled) {
          setMusicBlobState({ blob, key: musicObjectKey });
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          setMusicLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load music preview.",
          );
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsMusicLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [music, musicBlobState?.key, musicObject, musicObjectKey]);

  const removeMusic = useCallback(async () => {
    setMusic(null);
    setMusicBlobState(null);
    setMusicLoadError(null);
  }, []);

  const saveMusic = useCallback(async () => {
    if (!musicEditor || !hasUnsavedChanges) {
      return true;
    }

    const nextMusic = currentMusic
      ? {
          ...currentMusic,
          updatedAt: new Date().toISOString(),
        }
      : null;

    try {
      if (nextMusic) {
        await musicEditor.onSave(nextMusic);
      } else {
        await musicEditor.onRemove();
      }
      setMusic(nextMusic);
      setSavedMusic(nextMusic);
      return true;
    } catch {
      return false;
    }
  }, [currentMusic, hasUnsavedChanges, musicEditor]);

  const selectMusicTrack = useCallback(
    async (track: SharedMusicTrack) => {
      if (!musicEditor) {
        return;
      }

      const nextMusic = createCliprMusicMetadataFromSharedTrack(track);

      setMusic(nextMusic);
      setMusicEnabled(nextMusic.enabled);
      setMusicVolume(nextMusic.volume);
      setMusicBlobState(null);
      setMusicLoadError(null);
    },
    [musicEditor],
  );

  return {
    error: musicEditor?.error ?? musicLoadError,
    isMusicLoading,
    isSaving: musicEditor?.isSaving ?? false,
    hasUnsavedChanges,
    music,
    musicBlob,
    musicEnabled,
    musicVolume,
    removeMusic,
    saveMusic,
    selectMusicTrack,
    setMusicEnabled,
    setMusicVolume,
  };
}
