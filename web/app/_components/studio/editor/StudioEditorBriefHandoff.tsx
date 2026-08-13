"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LazyReelReadOnlyResultDetails } from "@/app/_components/studio/research/LazyReelReadOnlyResultDetails";
import { parseLazyReelStoredResult } from "@/app/_components/studio/research/parseLazyReelStoredResult";
import { StudioEditorState } from "@/app/_components/studio/editor/StudioEditorState";
import { useStudioEditorBriefHandoffCreation } from "@/app/_components/studio/editor/useStudioEditorBriefHandoffCreation";
import { useStudioEditorSourceCatalog } from "@/lib/clipstitchr/hooks/studioEditor/useStudioEditorSourceCatalog";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorBriefHandoffProps = {
  briefId: string;
  onCancel: () => void;
  onOpen: (projectId: string) => void;
  productId: string;
};

export function StudioEditorBriefHandoff({
  briefId,
  onCancel,
  onOpen,
  productId,
}: StudioEditorBriefHandoffProps) {
  const brief = useQuery(api.studioLazyReelCreativeBriefs.get.get, {
    id: briefId,
    productId,
  });
  const result = brief
    ? parseLazyReelStoredResult(brief.briefSnapshot.payloadJson)
    : null;
  const isApprovedEditorHandoff = Boolean(
    brief &&
      brief.status === "active" &&
      brief.approvalState === "approved" &&
      brief.handoffDestination === "studio_edit" &&
      result,
  );
  const sourceCatalog = useStudioEditorSourceCatalog(
    isApprovedEditorHandoff ? productId : undefined,
  );
  const sources = [
    ...sourceCatalog.catalog.videoClips,
    ...sourceCatalog.catalog.stitches,
  ];
  const creation = useStudioEditorBriefHandoffCreation(
    brief,
    sources,
    productId,
    onOpen,
  );

  if (brief === undefined) {
    return (
      <StudioEditorState
        message="Checking the approved direction and its Product ownership."
        title="Opening the Research brief"
      />
    );
  }

  if (
    !brief ||
    brief.status !== "active" ||
    brief.approvalState !== "approved" ||
    brief.handoffDestination !== "studio_edit" ||
    !result
  ) {
    return (
      <StudioEditorState
        actionLabel="Back to edits"
        message="This approved Research handoff is unavailable for the active Product. Review its destination in Research, or choose another edit."
        onAction={onCancel}
        title="Brief handoff not found"
      />
    );
  }

  return (
    <section
      aria-labelledby="editor-brief-handoff-title"
      className={styles.briefHandoff}
    >
      <header>
        <p className={styles.briefHandoffContext}>Approved Research direction</p>
        <h2 id="editor-brief-handoff-title">{brief.title}</h2>
        <p>{result.summary}</p>
      </header>
      <details className={styles.briefHandoffDetails}>
        <summary>Read the complete brief</summary>
        <LazyReelReadOnlyResultDetails result={result} />
      </details>
      {sourceCatalog.error ? (
        <div className={styles.inlineError} role="alert">
          <p>{sourceCatalog.error}</p>
          <button onClick={() => void sourceCatalog.reload()} type="button">
            Try the source shelf again
          </button>
        </div>
      ) : sourceCatalog.isLoading ? (
        <p className={styles.loadingMessage} role="status">
          Opening this Product&apos;s video shelf...
        </p>
      ) : sources.length === 0 ? (
        <div className={styles.briefHandoffEmpty}>
          <p>The editor needs one Product video to build the first timeline.</p>
          <Link href="/dashboard/studio/clips">Create or accept a clip</Link>
        </div>
      ) : (
        <form className={styles.briefHandoffForm} onSubmit={(event) => void creation.submit(event)}>
          <label>
            Start the timeline with
            <select
              disabled={creation.isCreating}
              onChange={(event) => creation.setSelectedSourceKey(event.target.value)}
              required
              value={creation.selectedSourceKey}
            >
              <option value="">Choose a Product video</option>
              {sources.map((source) => (
                <option
                  key={`${source.kind}:${source.id}`}
                  value={`${source.kind}:${source.id}`}
                >
                  {source.name} ({source.durationSeconds.toFixed(1)} seconds)
                </option>
              ))}
            </select>
          </label>
          <div className={styles.briefHandoffActions}>
            <button disabled={creation.isCreating} type="submit">
              {creation.isCreating ? "Starting the edit..." : "Create edit from brief"}
            </button>
            <button
              className={styles.quietButton}
              disabled={creation.isCreating}
              onClick={onCancel}
              type="button"
            >
              Back to edits
            </button>
          </div>
          {creation.isCreating ? (
            <p role="status">
              Building a timeline with the selected Product video in place...
            </p>
          ) : null}
          {creation.error ? (
            <p className={styles.inlineError} role="alert">
              {creation.error}
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}
