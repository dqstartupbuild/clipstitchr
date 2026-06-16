"use client";

import { useCallback, useState } from "react";
import { createCliprJob } from "@/lib/clipstitchr/client/createCliprJob";
import type { CliprClientJob } from "@/lib/clipstitchr/types/CliprClientJob";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprGenerationMode } from "@/lib/clipstitchr/types/CliprGenerationMode";
import type { ProcessingStatus } from "@/lib/clipstitchr/types/ProcessingStatus";
import { createId } from "@/lib/clipstitchr/utils/createId";

type GenerateCliprOptions = {
  avatarId: string;
  avatarSceneLocation?: string;
  avatarSceneOutfit?: string;
  avatarScenePose?: string;
  demoClipId?: string;
  durationSeconds: CliprDurationSeconds;
  generationMode: CliprGenerationMode;
  musicTrackId?: string;
  productId: string;
  scriptIdea?: string;
  voiceId: string;
};

type UseCliprGenerationOptions = {
  onCreated?: () => void | Promise<void>;
};

export function useCliprGeneration({ onCreated }: UseCliprGenerationOptions) {
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Ready");
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<CliprClientJob | null>(null);
  const [finalClipId, setFinalClipId] = useState<string | null>(null);

  const generate = useCallback(
    async (options: GenerateCliprOptions) => {
      setStatus("reading");
      setProgress(0.05);
      setMessage("Starting Clipr generation");
      setError(null);
      setFinalClipId(null);
      const requestedJobId = createId();

      try {
        const nextJob = await createCliprJob({
          ...options,
          jobId: requestedJobId,
        });

        setJob(nextJob);
        await onCreated?.();

        setProgress(0.2);
        setMessage("Clip queued for background processing");
        setStatus("queued");

        return nextJob.id;
      } catch (nextError) {
        setStatus("error");
        setProgress(1);
        setMessage("Generation stopped");
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to generate this Clipr clip.",
        );
        return null;
      }
    },
    [onCreated],
  );

  return {
    error,
    finalClipId,
    generate,
    isGenerating:
      status !== "idle" &&
      status !== "queued" &&
      status !== "complete" &&
      status !== "error",
    isQueued: status === "queued",
    job,
    message,
    progress,
    status,
  };
}
