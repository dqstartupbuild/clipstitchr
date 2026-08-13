import type { StudioClipsTranscriptExcerpt } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsTranscriptExcerpt";
import { formatStudioClipsDuration } from "./formatStudioClipsDuration";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsTranscriptProps = {
  excerpts: StudioClipsTranscriptExcerpt[];
};

export function StudioClipsTranscript({ excerpts }: StudioClipsTranscriptProps) {
  if (excerpts.length === 0) return null;

  return (
    <details className={styles.transcript}>
      <summary>Source transcript ({excerpts.length} excerpts)</summary>
      <ol>
        {excerpts.map((excerpt, index) => (
          <li key={`${excerpt.startSeconds}-${index}`}>
            <span>{formatStudioClipsDuration(excerpt.startSeconds)} - {formatStudioClipsDuration(excerpt.endSeconds)}</span>
            <p>{excerpt.text}</p>
          </li>
        ))}
      </ol>
    </details>
  );
}
