"use client";

import { useState } from "react";
import Link from "next/link";
import type { FunctionReturnType } from "convex/server";
import { formatLazyReelDateTime } from "./formatLazyReelDateTime";
import { parseLazyReelStoredResult } from "./parseLazyReelStoredResult";
import { LazyReelReadOnlyResultDetails } from "./LazyReelReadOnlyResultDetails";
import { api } from "@/convex/_generated/api";
import type { LazyReelBriefApprovalState } from "@/lib/clipstitchr/types/lazyreel/LazyReelBriefApprovalState";
import type { LazyReelBriefHandoffDestination } from "@/lib/clipstitchr/types/lazyreel/LazyReelBriefHandoffDestination";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelCreativeBrief = FunctionReturnType<
  typeof api.studioLazyReelCreativeBriefs.list.list
>[number];

type LazyReelCreativeBriefItemProps = {
  brief: LazyReelCreativeBrief;
  busyAction: string | null;
  onApprovalChange: (id: string, state: LazyReelBriefApprovalState) => void;
  onArchive: (id: string) => void;
  onHandoffChange: (
    id: string,
    destination?: LazyReelBriefHandoffDestination,
  ) => void;
};

export function LazyReelCreativeBriefItem({
  brief,
  busyAction,
  onApprovalChange,
  onArchive,
  onHandoffChange,
}: LazyReelCreativeBriefItemProps) {
  const result = parseLazyReelStoredResult(brief.briefSnapshot.payloadJson);
  const [handoff, setHandoff] = useState<"" | LazyReelBriefHandoffDestination>(
    brief.handoffDestination ?? "",
  );
  const handoffHref =
    brief.approvalState === "approved" && brief.handoffDestination
      ? brief.handoffDestination === "studio_stitch"
        ? `/dashboard/studio/stitch?briefId=${encodeURIComponent(brief.id)}`
        : `/dashboard/studio/edit?briefId=${encodeURIComponent(brief.id)}`
      : null;

  return (
    <li className={styles.briefRow}>
      <div className={styles.recordHeading}>
        <div>
          <strong>{brief.title}</strong>
          <span>Saved {formatLazyReelDateTime(brief.createdAt)}</span>
        </div>
        <p>{brief.approvalState === "approved" ? "Approved" : brief.approvalState === "rejected" ? "Needs a new direction" : "Draft"}</p>
      </div>
      {result ? <p>{result.summary}</p> : <p>The brief snapshot is not readable.</p>}
      {result ? (
        <details>
          <summary>Read complete creative brief</summary>
          <LazyReelReadOnlyResultDetails result={result} />
        </details>
      ) : null}
      <fieldset className={styles.approvalControls} disabled={busyAction !== null}>
        <legend>Review decision</legend>
        <button
          aria-pressed={brief.approvalState === "draft"}
          onClick={() => onApprovalChange(brief.id, "draft")}
          type="button"
        >
          Keep as draft
        </button>
        <button
          aria-pressed={brief.approvalState === "approved"}
          onClick={() => onApprovalChange(brief.id, "approved")}
          type="button"
        >
          Approve brief
        </button>
        <button
          aria-pressed={brief.approvalState === "rejected"}
          onClick={() => onApprovalChange(brief.id, "rejected")}
          type="button"
        >
          Reject direction
        </button>
      </fieldset>
      <div className={styles.handoffControls}>
        <label>
          Production handoff
          <select
            disabled={brief.approvalState !== "approved" || busyAction !== null}
            onChange={(event) => setHandoff(event.target.value as "" | LazyReelBriefHandoffDestination)}
            value={handoff}
          >
            <option value="">No handoff selected</option>
            <option value="studio_stitch">Studio Stitch</option>
            <option value="studio_edit">Studio editor</option>
          </select>
        </label>
        <button
          disabled={brief.approvalState !== "approved" || busyAction !== null}
          onClick={() => onHandoffChange(brief.id, handoff || undefined)}
          type="button"
        >
          Save destination
        </button>
        {handoffHref ? (
          <Link className={styles.handoffOpenAction} href={handoffHref}>
            Open in {brief.handoffDestination === "studio_stitch" ? "Studio Stitch" : "Studio editor"}
          </Link>
        ) : null}
      </div>
      <p className={styles.handoffNote}>
        {brief.approvalState !== "approved"
          ? "Approve this direction before choosing where production begins."
          : handoffHref
            ? "The saved destination opens with this Product and brief already in context."
            : "Choose a destination, save it, then open the next workspace here."}
      </p>
      {busyAction ? (
        <p className={styles.briefBusyStatus} role="status">
          {busyAction === "approval"
            ? "Updating the review decision..."
            : busyAction === "handoff"
              ? "Saving the production destination..."
              : "Archiving the brief..."}
        </p>
      ) : null}
      <button
        className={styles.archiveButton}
        disabled={busyAction !== null}
        onClick={() => onArchive(brief.id)}
        type="button"
      >
        {busyAction === "archive" ? "Archiving..." : "Archive brief"}
      </button>
    </li>
  );
}
