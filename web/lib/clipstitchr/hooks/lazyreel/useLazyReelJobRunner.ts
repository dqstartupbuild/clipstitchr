"use client";

import { useCallback, useRef, useState } from "react";
import type { LazyReelCompletedResearchJob } from "@/lib/clipstitchr/types/lazyreel/LazyReelCompletedResearchJob";
import type { LazyReelJobRunnerState } from "@/lib/clipstitchr/types/lazyreel/LazyReelJobRunnerState";
import type { LazyReelToolRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolRequest";
import type { LazyReelWorkflowRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowRequest";
import type { StudioLazyReelResearchRunResult } from "@/lib/clipstitchr/types/lazyreel/StudioLazyReelResearchRunResult";
import type { StudioLazyReelWorkflowRunResult } from "@/lib/clipstitchr/types/lazyreel/StudioLazyReelWorkflowRunResult";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { readLazyReelClientResponseError } from "./readLazyReelClientResponseError";

export function useLazyReelJobRunner(
  productId?: string,
): LazyReelJobRunnerState {
  const [completedJob, setCompletedJob] =
    useState<LazyReelCompletedResearchJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const retryKeys = useRef(new Map<string, string>());

  const run = useCallback(
    async (
      endpoint: "runs" | "workflows",
      request: LazyReelToolRequest | LazyReelWorkflowRequest,
    ) => {
      if (!productId || isRunning) {
        return;
      }

      const requestFingerprint = `${productId}:${endpoint}:${JSON.stringify(request)}`;
      const idempotencyKey =
        retryKeys.current.get(requestFingerprint) ?? createId();

      retryKeys.current.set(requestFingerprint, idempotencyKey);
      setCompletedJob(null);
      setError(null);
      setIsRunning(true);

      try {
        const response = await fetch(`/api/studio/research/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, idempotencyKey, request }),
        });

        if (!response.ok) {
          throw new Error(await readLazyReelClientResponseError(response));
        }

        if (endpoint === "runs") {
          const body = (await response.json()) as StudioLazyReelResearchRunResult;
          setCompletedJob({ kind: "tool", result: body.result, runId: body.runId });
        } else {
          const body = (await response.json()) as StudioLazyReelWorkflowRunResult;
          setCompletedJob({
            kind: "workflow",
            result: body.result,
            runId: body.runId,
          });
        }

        retryKeys.current.delete(requestFingerprint);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "The research job could not finish.",
        );
      } finally {
        setIsRunning(false);
      }
    },
    [isRunning, productId],
  );

  const runTool = useCallback(
    async (request: LazyReelToolRequest) => run("runs", request),
    [run],
  );
  const runWorkflow = useCallback(
    async (request: LazyReelWorkflowRequest) => run("workflows", request),
    [run],
  );
  const reset = useCallback(() => {
    setCompletedJob(null);
    setError(null);
  }, []);

  return { completedJob, error, isRunning, reset, runTool, runWorkflow };
}
