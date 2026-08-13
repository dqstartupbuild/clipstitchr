"use client";

import { useCallback, useState } from "react";
import type { StudioClipsTaskAction } from "./StudioClipsTaskAction";
import type { StudioClipsTaskDetail } from "./StudioClipsTaskDetail";
import { createStudioClipsIdempotencyKey } from "./createStudioClipsIdempotencyKey";
import { readStudioClipsJsonResponse } from "./readStudioClipsJsonResponse";

export function useStudioClipsTaskActions(productId: string | undefined) {
  const [busyAction, setBusyAction] = useState<StudioClipsTaskAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateTask = useCallback(
    async (taskId: string, action: StudioClipsTaskAction) => {
      if (!productId) return null;
      setBusyAction(action);
      setError(null);

      try {
        const isArchive = action === "archive";
        const response = await fetch(
          `/api/studio/clips/tasks/${encodeURIComponent(taskId)}${isArchive ? "" : `/${action}`}`,
          {
            method: isArchive ? "DELETE" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId,
              idempotencyKey: createStudioClipsIdempotencyKey(action),
            }),
          },
        );
        const body = await readStudioClipsJsonResponse<{
          task: StudioClipsTaskDetail;
          updated: boolean;
        }>(response);
        return body.task;
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to update this task.");
        return null;
      } finally {
        setBusyAction(null);
      }
    },
    [productId],
  );

  return { busyAction, error, updateTask };
}
