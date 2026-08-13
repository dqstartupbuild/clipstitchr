"use client";

import Link from "next/link";
import type { StudioStitchOutput } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchOutput";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

export function StudioStitchOutputCard({
  output,
  isBusy,
  onMaterialize,
}: {
  output: StudioStitchOutput;
  isBusy: boolean;
  onMaterialize: () => void;
}) {
  const handoff = output.handoff;
  const libraryAssetId = handoff?.libraryAssetId;
  const publishingSourceId = handoff?.publishingSourceId;
  const isMaterialized = Boolean(libraryAssetId);
  const statusId = `stitch-output-materialize-${output.id}`;
  return (
    <li className={styles.outputCard} data-status={output.status}>
      <header>
        <div>
          <strong>{output.recipeId}</strong>
          <span>{output.durationSeconds.toFixed(1)}s · {(output.byteLength / 1024 / 1024).toFixed(1)} MB</span>
        </div>
        <p>
          {isMaterialized
            ? "Accepted"
            : output.status === "accepted"
              ? "Needs Library save"
              : "Ready for review"}
        </p>
      </header>
      {!libraryAssetId ? (
        <details className={styles.handoffDetails}>
          <summary>Accept and save this video</summary>
          <div className={styles.handoffFields}>
            <p className={styles.handoffHonesty} id={statusId}>
              ClipStitchr will verify the finished MP4, save it to this
              Product&apos;s Library, and make it available to Edit and Publish.
              Nothing is posted automatically.
            </p>
            <button aria-describedby={statusId} disabled={isBusy} onClick={onMaterialize} type="button">
              {isBusy ? "Verifying and saving..." : "Accept and save video"}
            </button>
            {isBusy ? <p role="status">Checking and saving this video...</p> : null}
          </div>
        </details>
      ) : (
        <div className={styles.acceptedHandoffs}>
          <p>Saved to this Product&apos;s Library and ready for the next step.</p>
          <Link href="/dashboard/library?tab=ugc">Open Library</Link>
          <Link
            href={`/dashboard/studio/edit?sourceId=${encodeURIComponent(libraryAssetId)}`}
          >
            Open editor
          </Link>
          {publishingSourceId ? (
            <Link href={`/dashboard/studio/publishing/compose?kind=studio-stitch-output&recordId=${encodeURIComponent(publishingSourceId)}`}>
              Open publishing
            </Link>
          ) : null}
          <small>
            Edit starts a populated timeline. Publishing opens with this saved
            video selected and checks ownership again before sending.
          </small>
        </div>
      )}
    </li>
  );
}
