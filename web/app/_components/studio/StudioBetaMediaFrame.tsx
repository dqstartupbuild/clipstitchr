import type { StudioBetaWorkspaceMediaCard } from "@/lib/clipstitchr/types/StudioBetaWorkspaceMediaCard";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import styles from "@/app/dashboard/studio/studioBetaWorkspace.module.css";

type StudioBetaMediaFrameProps = {
  media: StudioBetaWorkspaceMediaCard;
  posterUrl?: string;
};

export function StudioBetaMediaFrame({
  media,
  posterUrl,
}: StudioBetaMediaFrameProps) {
  return (
    <article className={styles.mediaFrame}>
      <div
        aria-hidden
        className={styles.mediaFrameImage}
        style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
      >
        {posterUrl ? null : <span>NO POSTER</span>}
      </div>
      <div className={styles.mediaFrameCaption}>
        <p>{media.name}</p>
        <span>
          {media.kind === "stitch" ? "Finished cut" : "Source"} · {formatDuration(media.duration)}
        </span>
      </div>
    </article>
  );
}
