"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { serializeStudioEditorProjectSnapshot } from "@/lib/clipstitchr/studio/editor/serializeStudioEditorProjectSnapshot";
import type { StudioEditorProjectRecord } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectRecord";
import type { StudioEditorProjectV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectV1";
import type { StudioEditorSaveStatus } from "@/lib/clipstitchr/types/StudioEditorSaveStatus";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { warnStudioEditorBeforeUnload } from "./warnStudioEditorBeforeUnload";

const AUTOSAVE_DELAY_MS = 800;

export function useStudioEditorAutosave(
  project: StudioEditorProjectV1,
  record: StudioEditorProjectRecord,
) {
  const autosave = useMutation(api.studioEditorProjects.autosave.autosave);
  const revisionRef = useRef(record.revision);
  const lastSavedSnapshotRef = useRef(record.snapshotJson);
  const latestSnapshotRef = useRef(record.snapshotJson);
  const queueRef = useRef(Promise.resolve());
  const timeoutRef = useRef<number | null>(null);
  const [status, setStatus] = useState<StudioEditorSaveStatus>("saved");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      record.revision > revisionRef.current &&
      record.snapshotJson === lastSavedSnapshotRef.current
    ) {
      revisionRef.current = record.revision;
    }
  }, [record]);

  const enqueueSnapshot = useCallback(
    (snapshotJson: string) => {
      const task = queueRef.current.then(async () => {
        if (snapshotJson === lastSavedSnapshotRef.current) {
          return;
        }

        setStatus("saving");
        setError(null);

        try {
          const result = await autosave({
            id: project.id,
            productId: project.productId,
            expectedRevision: revisionRef.current,
            idempotencyKey: `autosave-${project.id}-${createId()}`,
            snapshotJson,
          });
          revisionRef.current = result.revision;
          lastSavedSnapshotRef.current = snapshotJson;
          setStatus(
            snapshotJson === latestSnapshotRef.current ? "saved" : "waiting",
          );
        } catch (caught) {
          const message =
            caught instanceof Error ? caught.message : "Autosave did not finish.";
          setError(message);
          setStatus(
            message.toLowerCase().includes("revision conflict")
              ? "conflict"
              : "error",
          );
          throw caught;
        }
      });
      queueRef.current = task.catch(() => undefined);

      return task;
    },
    [autosave, project.id, project.productId],
  );

  useEffect(() => {
    const snapshotJson = serializeStudioEditorProjectSnapshot(project);
    latestSnapshotRef.current = snapshotJson;

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (snapshotJson === lastSavedSnapshotRef.current) {
      setStatus("saved");
      return;
    }

    setStatus("waiting");
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      void enqueueSnapshot(snapshotJson).catch(() => undefined);
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [enqueueSnapshot, project]);

  const flush = useCallback(async () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const snapshotJson = serializeStudioEditorProjectSnapshot(project);
    latestSnapshotRef.current = snapshotJson;
    await enqueueSnapshot(snapshotJson);
  }, [enqueueSnapshot, project]);

  useEffect(() => {
    if (status === "saved") return;
    window.addEventListener("beforeunload", warnStudioEditorBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", warnStudioEditorBeforeUnload);
  }, [status]);

  return { error, flush, status };
}
