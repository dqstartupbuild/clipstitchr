import { api } from "@/convex/_generated/api";
import type { CliprJobServerContext } from "@/lib/clipstitchr/server/clipr/CliprJobServerContext";

type FailCliprJobOptions = CliprJobServerContext & {
  error: unknown;
  jobId: string;
};

export async function failCliprJob({
  convex,
  error,
  jobId,
  secret,
}: FailCliprJobOptions) {
  await convex
    .mutation(api.cliprJobs.fail, {
      secret,
      id: jobId,
      error:
        error instanceof Error
          ? error.message
          : "Unable to generate this Clipr clip.",
      updatedAt: new Date().toISOString(),
    })
    .catch(() => null);
}
