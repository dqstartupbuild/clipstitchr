"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { LazyReelCompletedResearchJob } from "@/lib/clipstitchr/types/lazyreel/LazyReelCompletedResearchJob";
import { createId } from "@/lib/clipstitchr/utils/createId";

export function useLazyReelResultSave(
  completedJob: LazyReelCompletedResearchJob,
  productId: string,
  snapshotVersion: string,
) {
  const saveReport = useMutation(api.studioLazyReelSavedReports.save.save);
  const saveBrief = useMutation(api.studioLazyReelCreativeBriefs.save.save);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const isCreativeBrief =
    completedJob.kind === "tool" && completedJob.result.tool === "make_brief";

  return {
    error,
    isCreativeBrief,
    status,
    save: async () => {
      if (status !== "idle") {
        return;
      }

      setError(null);
      setStatus("saving");

      try {
        const payloadJson = JSON.stringify(completedJob.result);

        if (isCreativeBrief && completedJob.kind === "tool") {
          await saveBrief({
            id: createId(),
            productId,
            researchRunId: completedJob.runId,
            title: completedJob.result.title,
            identity: { kind: "tool", key: "make_brief" },
            sourceSnapshotVersion: snapshotVersion,
            briefSnapshot: {
              schemaVersion: "studio-lazyreel-brief-v1",
              payloadJson,
            },
          });
        } else {
          await saveReport({
            id: createId(),
            productId,
            researchRunId: completedJob.runId,
            title: completedJob.result.title,
            identity:
              completedJob.kind === "tool"
                ? { kind: "tool", key: completedJob.result.tool }
                : { kind: "workflow", key: completedJob.result.workflow },
            sourceSnapshotVersion: snapshotVersion,
            reportSnapshot: {
              schemaVersion: "studio-lazyreel-saved-result-v1",
              payloadJson,
            },
          });
        }

        setStatus("saved");
      } catch (saveError) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : "This result could not be saved.",
        );
        setStatus("idle");
      }
    },
  } as const;
}
