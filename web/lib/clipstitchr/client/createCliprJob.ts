import type { CliprClientJob } from "@/lib/clipstitchr/types/CliprClientJob";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";

type CreateCliprJobOptions = {
  addMusic: boolean;
  avatarId: string;
  durationSeconds: CliprDurationSeconds;
  jobId: string;
  musicTrackId?: string;
  productId: string;
  scriptIdea?: string;
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
