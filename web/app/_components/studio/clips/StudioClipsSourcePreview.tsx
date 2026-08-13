"use client";

import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { StudioClipsSourceDraft } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsSourceDraft";
import { readStudioClipsYouTubeSource } from "@/lib/clipstitchr/hooks/studioClips/readStudioClipsYouTubeSource";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsSourcePreviewProps = {
  source: StudioClipsSourceDraft;
};

export function StudioClipsSourcePreview({ source }: StudioClipsSourcePreviewProps) {
  const localUrl = useObjectUrl(source.kind === "upload" ? source.file : null);
  let youtubePreview: ReturnType<typeof readStudioClipsYouTubeSource> | null = null;

  if (source.kind === "youtube" && source.url.trim()) {
    try {
      youtubePreview = readStudioClipsYouTubeSource(source.url.trim());
    } catch {
      youtubePreview = null;
    }
  }

  if (source.kind === "upload" && localUrl) {
    return (
      <div className={styles.sourcePreview}>
        <video controls preload="metadata" src={localUrl}>
          Your browser cannot preview this video.
        </video>
        <p>{source.file?.name}</p>
      </div>
    );
  }

  if (youtubePreview) {
    return (
      <div className={styles.sourcePreview}>
        <div
          aria-label={`YouTube video ${youtubePreview.videoId} preview image`}
          className={styles.youtubePreview}
          role="img"
          style={{ backgroundImage: `url(${youtubePreview.thumbnailUrl})` }}
        />
        <p>YouTube video {youtubePreview.videoId}</p>
      </div>
    );
  }

  return (
    <div className={styles.emptyPreview} aria-live="polite">
      <span aria-hidden>09:16</span>
      <p>{source.kind === "youtube" ? "A valid YouTube preview will appear here." : "Your source preview will stay here while you set up the task."}</p>
    </div>
  );
}
