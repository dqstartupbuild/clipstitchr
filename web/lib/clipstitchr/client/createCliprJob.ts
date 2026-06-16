import type { CliprClientJob } from "@/lib/clipstitchr/types/CliprClientJob";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprGenerationMode } from "@/lib/clipstitchr/types/CliprGenerationMode";
import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";

type CreateCliprJobOptions = {
  avatarId: string;
  avatarSceneLocation?: string;
  avatarSceneOutfit?: string;
  avatarScenePose?: string;
  demoClipId?: string;
  durationSeconds: CliprDurationSeconds;
  generationMode: CliprGenerationMode;
  jobId: string;
  musicTrackId?: string;
  productId: string;
  scriptIdea?: string;
  videoModelId?: CliprVideoModelId;
  voiceId: string;
};

export async function createCliprJob(options: CreateCliprJobOptions) {
  const response = await fetch("/api/clipr/jobs", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? "Unable to generate this Clipr clip.");
  }

  return ((await response.json()) as { job: CliprClientJob }).job;
}
