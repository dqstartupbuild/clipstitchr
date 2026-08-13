import { lazyReelWorkflowKeys } from "@/lib/clipstitchr/server/studio/lazyreel/lazyReelWorkflowKeys";
import type { LazyReelWorkflowKey } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowKey";
import type { LazyReelWorkflowRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowRequest";
import { lazyReelResearchInputLimits } from "./lazyReelResearchInputLimits";
import { readLazyReelObject } from "./readLazyReelObject";
import { readLazyReelOptionalInteger } from "./readLazyReelOptionalInteger";
import { readLazyReelRequiredString } from "./readLazyReelRequiredString";

const workflowKeys = new Set<LazyReelWorkflowKey>(lazyReelWorkflowKeys);

export function readLazyReelWorkflowRequest(
  value: unknown,
): LazyReelWorkflowRequest {
  const request = readLazyReelObject(value, "Workflow request");
  const workflow = readLazyReelRequiredString(
    request.workflow,
    "Workflow",
    48,
  ) as LazyReelWorkflowKey;

  if (!workflowKeys.has(workflow)) {
    throw new Error("Choose one of the available LazyReel workflows.");
  }

  return {
    brief: readLazyReelRequiredString(
      request.brief,
      "Brief",
      lazyReelResearchInputLimits.longText,
    ),
    targetDurationSeconds: readLazyReelOptionalInteger(
      request.targetDurationSeconds,
      "Target duration",
      5,
      180,
    ),
    workflow,
  };
}
