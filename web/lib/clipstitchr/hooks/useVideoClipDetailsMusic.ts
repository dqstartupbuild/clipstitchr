"use client";

import { useCallback, useEffect, useState } from "react";
import { downloadMusicBlob } from "@/lib/clipstitchr/client/r2/downloadMusicBlob";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { VideoClipDetailsMusicEditor } from "@/lib/clipstitchr/types/VideoClipDetailsMusicEditor";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { createCliprMusicMetadataFromSharedTrack } from "@/lib/clipstitchr/utils/createCliprMusicMetadataFromSharedTrack";

type UseVideoClipDetailsMusicOptions = {
  clip: VideoClipMetadata;
  musicEditor?: VideoClipDetailsMusicEditor;
};

export function useVideoClipDetailsMusic({
  clip,
  musicEditor,
}: UseVideoClipDetailsMusicOptions) {
  const [music, setMusic] = useState<CliprMusicMetadata | null>(
    clip.cliprMetadata?.music ?? null,
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

  const generateMusic = useCallback(async () => {
    if (!musicEditor) {
      return;
    }

    const nextMusic = await musicEditor.onGenerate();

    if (nextMusic) {
      setMusic(nextMusic);
      setMusicEnabled(nextMusic.enabled);
      setMusicVolume(nextMusic.volume);
      setMusicBlobState(null);
    }
  }, [musicEditor]);

  const removeMusic = useCallback(async () => {
    if (!musicEditor) {
      return;
    }

    try {
      await musicEditor.onRemove();
      setMusic(null);
      setMusicBlobState(null);
      setMusicLoadError(null);
    } catch {
      return;
    }
  }, [musicEditor]);

  const saveMusic = useCallback(async () => {
    if (!music || !musicEditor) {
      return;
    }

    const nextMusic = {
      ...music,
      enabled: musicEnabled,
      volume: musicVolume,
      updatedAt: new Date().toISOString(),
    };

    try {
      await musicEditor.onSave(nextMusic);
      setMusic(nextMusic);
    } catch {
      return;
    }
  }, [music, musicEditor, musicEnabled, musicVolume]);

  const selectMusicTrack = useCallback(
    async (track: SharedMusicTrack) => {
      if (!musicEditor) {
        return;
      }

      const nextMusic = createCliprMusicMetadataFromSharedTrack(track);

      try {
        await musicEditor.onSave(nextMusic);
        setMusic(nextMusic);
        setMusicEnabled(nextMusic.enabled);
        setMusicVolume(nextMusic.volume);
        setMusicBlobState(null);
        setMusicLoadError(null);
      } catch {
        return;
      }
    },
    [musicEditor],
  );

  return {
    error: musicEditor?.error ?? musicLoadError,
    generateMusic,
    isGenerating: musicEditor?.isGenerating ?? false,
    isMusicLoading,
    isSaving: musicEditor?.isSaving ?? false,
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
