"use client";

import { Download, Music2, Shuffle, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/app/_components/ui/Badge";
import { IconButton } from "@/app/_components/ui/IconButton";
import { IconButtonLink } from "@/app/_components/ui/IconButtonLink";
import { Panel } from "@/app/_components/ui/Panel";
import { StitchMusicSettingsDialog } from "@/app/_components/dashboard/StitchMusicSettingsDialog";
import { VideoPreview } from "@/app/_components/ui/VideoPreview";
import { createStitchExportBlob } from "@/lib/clipstitchr/client/createStitchExportBlob";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";
import { downloadBlob } from "@/lib/clipstitchr/utils/downloadBlob";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getUseInSwaprStitchHref } from "@/lib/clipstitchr/utils/getUseInSwaprStitchHref";

type StitchCardProps = {
  stitch: Stitch;
  onDelete: (id: string) => void | Promise<void>;
  onGenerateMusic: (stitch: Stitch) => Promise<StitchMusicMetadata | null>;
  onUpdateMusic: (
    stitch: Stitch,
    music: StitchMusicMetadata | null,
  ) => void | Promise<void>;
};

export function StitchCard({
  stitch,
  onDelete,
  onGenerateMusic,
  onUpdateMusic,
}: StitchCardProps) {
  const url = useObjectUrl(stitch.blob);
  const posterUrl = useObjectUrl(stitch.posterBlob);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [isSavingMusic, setIsSavingMusic] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [musicError, setMusicError] = useState<string | null>(null);
  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      downloadBlob(await createStitchExportBlob(stitch), stitch.name);
    } catch (nextError) {
      setDownloadError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to export this stitch.",
      );
    } finally {
      setIsDownloading(false);
    }
  };
  const handleGenerateMusic = async () => {
    setIsGeneratingMusic(true);
    setMusicError(null);

    try {
      return await onGenerateMusic(stitch);
    } catch (nextError) {
      setMusicError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to generate stitch music.",
      );
      return null;
    } finally {
      setIsGeneratingMusic(false);
    }
  };
  const handleUpdateMusic = async (music: StitchMusicMetadata | null) => {
    setIsSavingMusic(true);
    setMusicError(null);

    try {
      await onUpdateMusic(stitch, music);
    } catch (nextError) {
      setMusicError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to update stitch music.",
      );
      throw nextError;
    } finally {
      setIsSavingMusic(false);
    }
  };

  return (
    <>
      <Panel className="w-full max-w-[390px] justify-self-center overflow-hidden">
        <div className="mx-auto max-w-[390px]">
          <VideoPreview src={url} posterSrc={posterUrl} label={stitch.name} />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-text-primary">
                {stitch.name}
              </h3>
              <p className="mt-1 text-xs text-text-tertiary">
                {formatDuration(stitch.duration)} . {formatBytes(stitch.size)}
              </p>
              <p className="mt-2 text-xs text-text-secondary">
                {formatDate(stitch.createdAt)}
              </p>
            </div>
            <Badge>STITCH</Badge>
          </div>
          <div className="mt-4 flex gap-2">
            <IconButtonLink
              label="Use in Swapr"
              href={getUseInSwaprStitchHref(stitch)}
              icon={<Shuffle aria-hidden className="h-4 w-4" />}
            />
            <IconButton
              label="Download stitch"
              icon={<Download aria-hidden className="h-4 w-4" />}
              disabled={!url || isDownloading}
              onClick={() => void handleDownload()}
            />
            <IconButton
              label="Edit stitch music"
              icon={<Music2 aria-hidden className="h-4 w-4" />}
              onClick={() => setIsMusicOpen(true)}
            />
            <IconButton
              label="Delete stitch"
              variant="danger"
              icon={<Trash2 aria-hidden className="h-4 w-4" />}
              onClick={() => void onDelete(stitch.id)}
            />
          </div>
          {downloadError ? (
            <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
              {downloadError}
            </p>
          ) : null}
        </div>
      </Panel>
      {isMusicOpen ? (
        <StitchMusicSettingsDialog
          stitch={stitch}
          error={musicError}
          isGenerating={isGeneratingMusic}
          isSaving={isSavingMusic}
          onClose={() => setIsMusicOpen(false)}
          onGenerate={handleGenerateMusic}
          onRemove={() => handleUpdateMusic(null)}
          onSave={handleUpdateMusic}
        />
      ) : null}
    </>
  );
}
